"use server";

import { MatchMode, MatchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";

const createMatchSchema = z.object({
  mode: z.nativeEnum(MatchMode),
  leftPlayerId: z.string().trim().min(1),
  leftTeammateId: z.string().trim().optional(),
  rightPlayerId: z.string().trim().min(1),
  rightTeammateId: z.string().trim().optional(),
  notes: z.string().trim().max(500).optional().transform((value) => value || null),
});

type MatchSidePlayer = {
  id: string;
  displayName: string;
  rating: number;
};

function normalizeOptionalPlayerId(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function getMatchPlayers(mode: MatchMode, payload: z.infer<typeof createMatchSchema>) {
  const leftTeammateId = normalizeOptionalPlayerId(payload.leftTeammateId);
  const rightTeammateId = normalizeOptionalPlayerId(payload.rightTeammateId);

  if (mode === MatchMode.ONE_VS_ONE) {
    return {
      leftPlayerIds: [payload.leftPlayerId],
      rightPlayerIds: [payload.rightPlayerId],
    };
  }

  if (!leftTeammateId || !rightTeammateId) {
    redirect("/matches/new?error=invalid_match_payload");
  }

  return {
    leftPlayerIds: [payload.leftPlayerId, leftTeammateId],
    rightPlayerIds: [payload.rightPlayerId, rightTeammateId],
  };
}

function hasDuplicates(playerIds: string[]) {
  return new Set(playerIds).size !== playerIds.length;
}

function buildSideName(players: MatchSidePlayer[]) {
  return players.map((player) => player.displayName).join(" + ");
}

function buildSideSeedRating(players: MatchSidePlayer[]) {
  return players.reduce((total, player) => total + player.rating, 0);
}

export async function createMatchAction(formData: FormData) {
  const actingUser = await requireAdminUser();

  const parsed = createMatchSchema.safeParse({
    mode: formData.get("mode"),
    leftPlayerId: formData.get("leftPlayerId"),
    leftTeammateId: formData.get("leftTeammateId"),
    rightPlayerId: formData.get("rightPlayerId"),
    rightTeammateId: formData.get("rightTeammateId"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirect("/matches/new?error=invalid_match_payload");
  }

  const { leftPlayerIds, rightPlayerIds } = getMatchPlayers(parsed.data.mode, parsed.data);
  const allPlayerIds = [...leftPlayerIds, ...rightPlayerIds];

  if (hasDuplicates(allPlayerIds)) {
    redirect("/matches/new?error=duplicate_players");
  }

  const players = await prisma.playerProfile.findMany({
    where: {
      id: {
        in: allPlayerIds,
      },
      user: {
        isActive: true,
      },
    },
  });

  if (players.length !== allPlayerIds.length) {
    redirect("/matches/new?error=players_not_available");
  }

  const playersById = new Map(players.map((player) => [player.id, player]));
  const leftSidePlayers = leftPlayerIds.map((playerId) => playersById.get(playerId)).filter(Boolean) as MatchSidePlayer[];
  const rightSidePlayers = rightPlayerIds.map((playerId) => playersById.get(playerId)).filter(Boolean) as MatchSidePlayer[];

  if (leftSidePlayers.length !== leftPlayerIds.length || rightSidePlayers.length !== rightPlayerIds.length) {
    redirect("/matches/new?error=players_not_available");
  }

  const match = await prisma.$transaction(async (tx) => {
    return tx.match.create({
      data: {
        mode: parsed.data.mode,
        status: MatchStatus.DRAFT,
        createdByUserId: actingUser.id,
        notes: parsed.data.notes,
        sides: {
          create: [
            {
              sideIndex: 1,
              name: buildSideName(leftSidePlayers),
              seedRating: buildSideSeedRating(leftSidePlayers),
              players: {
                create: leftSidePlayers.map((player, index) => ({
                  slotIndex: index + 1,
                  playerProfileId: player.id,
                  ratingBefore: player.rating,
                })),
              },
            },
            {
              sideIndex: 2,
              name: buildSideName(rightSidePlayers),
              seedRating: buildSideSeedRating(rightSidePlayers),
              players: {
                create: rightSidePlayers.map((player, index) => ({
                  slotIndex: index + 1,
                  playerProfileId: player.id,
                  ratingBefore: player.rating,
                })),
              },
            },
          ],
        },
      },
      select: { id: true },
    });
  });

  revalidatePath("/");
  revalidatePath("/matches/new");
  redirect(`/matches/${match.id}?created=1`);
}
