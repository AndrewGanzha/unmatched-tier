"use server";

import { MatchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";
import { calculateEloDelta } from "@/modules/rating/server/elo";

const recordMatchResultSchema = z.object({
  matchId: z.string().trim().min(1),
  winningSideId: z.string().trim().min(1),
});

const K_FACTOR = 32;

export async function recordMatchResultAction(formData: FormData) {
  const actingUser = await requireAdminUser();

  const parsed = recordMatchResultSchema.safeParse({
    matchId: formData.get("matchId"),
    winningSideId: formData.get("winningSideId"),
  });

  if (!parsed.success) {
    redirect("/matches/new?error=invalid_result_payload");
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    include: {
      result: true,
      sides: {
        orderBy: { sideIndex: "asc" },
        include: {
          players: {
            orderBy: { slotIndex: "asc" },
            include: {
              playerProfile: true,
            },
          },
        },
      },
    },
  });

  if (!match) {
    redirect("/matches/new?error=match_not_found");
  }

  if (match.status !== MatchStatus.READY) {
    redirect(`/matches/${match.id}?error=match_not_ready`);
  }

  if (match.result) {
    redirect(`/matches/${match.id}?error=result_already_recorded`);
  }

  if (match.sides.length !== 2) {
    redirect(`/matches/${match.id}?error=unsupported_match_shape`);
  }

  const winningSide = match.sides.find((side) => side.id === parsed.data.winningSideId);
  const losingSide = match.sides.find((side) => side.id !== parsed.data.winningSideId);

  if (!winningSide || !losingSide) {
    redirect(`/matches/${match.id}?error=winning_side_invalid`);
  }

  const winnerTeamRating = winningSide.seedRating;
  const loserTeamRating = losingSide.seedRating;
  const winnerDelta = calculateEloDelta(winnerTeamRating, loserTeamRating, 1, K_FACTOR);
  const loserDelta = calculateEloDelta(loserTeamRating, winnerTeamRating, 0, K_FACTOR);

  await prisma.$transaction(async (tx) => {
    await tx.matchResult.create({
      data: {
        matchId: match.id,
        winningSideId: winningSide.id,
        recordedByUserId: actingUser.id,
        payload: JSON.stringify({
          mode: match.mode,
          winnerDelta,
          loserDelta,
        }),
      },
    });

    await tx.match.update({
      where: { id: match.id },
      data: {
        status: MatchStatus.RATED,
        finishedAt: new Date(),
      },
    });

    await tx.matchSide.updateMany({
      where: { matchId: match.id },
      data: { isWinner: false },
    });

    await tx.matchSide.update({
      where: { id: winningSide.id },
      data: { isWinner: true },
    });

    for (const player of winningSide.players) {
      const ratingAfter = player.ratingBefore + winnerDelta;

      await tx.matchPlayer.update({
        where: { id: player.id },
        data: {
          ratingAfter,
          ratingDelta: winnerDelta,
        },
      });

      await tx.playerProfile.update({
        where: { id: player.playerProfileId },
        data: {
          rating: ratingAfter,
          wins: { increment: 1 },
          matchesPlayed: { increment: 1 },
        },
      });

      await tx.ratingEvent.create({
        data: {
          playerProfileId: player.playerProfileId,
          matchId: match.id,
          ratingBefore: player.ratingBefore,
          ratingAfter,
          delta: winnerDelta,
          kFactor: K_FACTOR,
        },
      });
    }

    for (const player of losingSide.players) {
      const ratingAfter = player.ratingBefore + loserDelta;

      await tx.matchPlayer.update({
        where: { id: player.id },
        data: {
          ratingAfter,
          ratingDelta: loserDelta,
        },
      });

      await tx.playerProfile.update({
        where: { id: player.playerProfileId },
        data: {
          rating: ratingAfter,
          losses: { increment: 1 },
          matchesPlayed: { increment: 1 },
        },
      });

      await tx.ratingEvent.create({
        data: {
          playerProfileId: player.playerProfileId,
          matchId: match.id,
          ratingBefore: player.ratingBefore,
          ratingAfter,
          delta: loserDelta,
          kFactor: K_FACTOR,
        },
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath(`/matches/${match.id}`);
  redirect(`/matches/${match.id}?rated=1`);
}
