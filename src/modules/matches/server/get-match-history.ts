import { prisma } from "@/lib/prisma";

export async function getMatchHistory(limit = 50) {
  const matches = await prisma.match.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
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

  return matches.map((match) => ({
    id: match.id,
    mode: match.mode,
    status: match.status,
    createdAt: match.createdAt.toISOString(),
    finishedAt: match.finishedAt?.toISOString() ?? null,
    result: match.result
      ? {
          winningSideId: match.result.winningSideId,
          recordedAt: match.result.recordedAt.toISOString(),
        }
      : null,
    sides: match.sides.map((side) => ({
      id: side.id,
      sideIndex: side.sideIndex,
      name: side.name,
      isWinner: side.isWinner,
      players: side.players.map((player) => ({
        id: player.id,
        displayName: player.playerProfile.displayName,
        ratingBefore: player.ratingBefore,
        ratingAfter: player.ratingAfter,
        ratingDelta: player.ratingDelta,
        hero: player.heroPick?.hero
          ? {
              name: player.heroPick.hero.name,
              tier: player.heroPick.hero.tier,
            }
          : null,
      })),
    })),
  }));
}

