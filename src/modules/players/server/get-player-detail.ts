import { prisma } from "@/lib/prisma";

export async function getPlayerDetail(playerId: string) {
  const player = await prisma.playerProfile.findUnique({
    where: { id: playerId },
    include: {
      user: true,
      ratingEvents: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      matchPlayers: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          heroPick: {
            include: {
              hero: true,
            },
          },
          matchSide: {
            include: {
              match: {
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
              },
            },
          },
        },
      },
    },
  });

  if (!player) {
    return null;
  }

  return {
    id: player.id,
    displayName: player.displayName,
    email: player.user.email,
    role: player.user.role,
    rating: player.rating,
    wins: player.wins,
    losses: player.losses,
    draws: player.draws,
    matchesPlayed: player.matchesPlayed,
    recentMatches: player.matchPlayers.map((matchPlayer) => {
      const match = matchPlayer.matchSide.match;
      const ownSideId = matchPlayer.matchSide.id;
      const opponentNames = match.sides
        .filter((side) => side.id !== ownSideId)
        .flatMap((side) => side.players.map((entry) => entry.playerProfile.displayName));

      return {
        id: match.id,
        mode: match.mode,
        status: match.status,
        createdAt: match.createdAt.toISOString(),
        isWinner: matchPlayer.matchSide.isWinner,
        ratingBefore: matchPlayer.ratingBefore,
        ratingAfter: matchPlayer.ratingAfter,
        ratingDelta: matchPlayer.ratingDelta,
        opponents: opponentNames,
        hero: matchPlayer.heroPick?.hero
          ? {
              name: matchPlayer.heroPick.hero.name,
              tier: matchPlayer.heroPick.hero.tier,
              imagePath: matchPlayer.heroPick.hero.imagePath,
            }
          : null,
      };
    }),
    ratingHistory: player.ratingEvents.map((event) => ({
      id: event.id,
      matchId: event.matchId,
      ratingBefore: event.ratingBefore,
      ratingAfter: event.ratingAfter,
      delta: event.delta,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
