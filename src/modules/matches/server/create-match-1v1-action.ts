"use server";

import { MatchMode, MatchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";

const createMatchSchema = z.object({
  leftPlayerId: z.string().trim().min(1),
  rightPlayerId: z.string().trim().min(1),
  notes: z.string().trim().max(500).optional().transform((value) => value || null),
});

export async function createMatch1v1Action(formData: FormData) {
  const actingUser = await requireAdminUser();

  const parsed = createMatchSchema.safeParse({
    leftPlayerId: formData.get("leftPlayerId"),
    rightPlayerId: formData.get("rightPlayerId"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirect("/matches/new?error=invalid_match_payload");
  }

  if (parsed.data.leftPlayerId === parsed.data.rightPlayerId) {
    redirect("/matches/new?error=duplicate_players");
  }

  const players = await prisma.playerProfile.findMany({
    where: {
      id: {
        in: [parsed.data.leftPlayerId, parsed.data.rightPlayerId],
      },
    },
  });

  if (players.length !== 2) {
    redirect("/matches/new?error=players_not_found");
  }

  const leftPlayer = players.find((player) => player.id === parsed.data.leftPlayerId)!;
  const rightPlayer = players.find((player) => player.id === parsed.data.rightPlayerId)!;

  const match = await prisma.$transaction(async (tx) => {
    return tx.match.create({
      data: {
        mode: MatchMode.ONE_VS_ONE,
        status: MatchStatus.DRAFT,
        createdByUserId: actingUser.id,
        notes: parsed.data.notes,
        sides: {
          create: [
            {
              sideIndex: 1,
              name: leftPlayer.displayName,
              seedRating: leftPlayer.rating,
              players: {
                create: {
                  slotIndex: 1,
                  playerProfileId: leftPlayer.id,
                  ratingBefore: leftPlayer.rating,
                },
              },
            },
            {
              sideIndex: 2,
              name: rightPlayer.displayName,
              seedRating: rightPlayer.rating,
              players: {
                create: {
                  slotIndex: 1,
                  playerProfileId: rightPlayer.id,
                  ratingBefore: rightPlayer.rating,
                },
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
