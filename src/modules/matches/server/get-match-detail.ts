import { prisma } from "@/lib/prisma";

export async function getMatchDetail(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      createdByUser: {
        select: {
          email: true,
        },
      },
      sides: {
        orderBy: { sideIndex: "asc" },
        include: {
          players: {
            orderBy: { slotIndex: "asc" },
            include: {
              playerProfile: true,
              heroPick: {
                include: {
                  hero: true,
                },
              },
            },
          },
        },
      },
      result: true,
    },
  });

  if (!match) {
    return null;
  }

  return {
    id: match.id,
    mode: match.mode,
    status: match.status,
    notes: match.notes,
    createdAt: match.createdAt.toISOString(),
    createdBy: match.createdByUser.email,
    result: match.result
      ? {
          recordedAt: match.result.recordedAt.toISOString(),
          winningSideId: match.result.winningSideId,
        }
      : null,
    sides: match.sides.map((side) => ({
      id: side.id,
      sideIndex: side.sideIndex,
      name: side.name,
      seedRating: side.seedRating,
      isWinner: side.isWinner,
      players: side.players.map((player) => ({
        id: player.id,
        slotIndex: player.slotIndex,
        displayName: player.playerProfile.displayName,
        ratingBefore: player.ratingBefore,
        ratingAfter: player.ratingAfter,
        ratingDelta: player.ratingDelta,
        hero: player.heroPick?.hero
          ? {
              name: player.heroPick.hero.name,
              tier: player.heroPick.hero.tier,
              powerScore: player.heroPick.hero.powerScore,
            }
          : null,
      })),
    })),
    canAssignHeroes:
      match.status === "DRAFT" && match.sides.every((side) => side.players.length > 0),
    canMarkReady:
      match.status === "DRAFT" &&
      match.sides.every((side) => side.players.length > 0) &&
      match.sides.flatMap((side) => side.players).every((player) => Boolean(player.heroPick)),
    canRecordResult: match.status === "READY" && !match.result,
  };
}
