import { prisma } from "@/lib/prisma";

export async function getDashboardSummary() {
  const [playerCount, heroCount, activeHeroCount, matchCount, tournamentCount, latestMatches] =
    await Promise.all([
      prisma.playerProfile.count(),
      prisma.hero.count(),
      prisma.hero.count({ where: { isActive: true } }),
      prisma.match.count(),
      prisma.tournament.count(),
      prisma.match.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          sides: {
            include: {
              players: {
                include: {
                  playerProfile: true,
                },
              },
            },
            orderBy: { sideIndex: "asc" },
          },
        },
      }),
    ]);

  return {
    stats: {
      playerCount,
      heroCount,
      activeHeroCount,
      matchCount,
      tournamentCount,
    },
    latestMatches: latestMatches.map((match) => ({
      id: match.id,
      mode: match.mode,
      status: match.status,
      createdAt: match.createdAt.toISOString(),
      sides: match.sides.map((side) => ({
        id: side.id,
        sideIndex: side.sideIndex,
        isWinner: side.isWinner,
        players: side.players.map((player) => player.playerProfile.displayName),
      })),
    })),
  };
}
