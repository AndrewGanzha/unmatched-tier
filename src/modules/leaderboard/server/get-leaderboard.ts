import { prisma } from "@/lib/prisma";

export async function getLeaderboard(limit = 20) {
  const players = await prisma.playerProfile.findMany({
    orderBy: [{ rating: "desc" }, { wins: "desc" }, { displayName: "asc" }],
    take: limit,
  });

  return players.map((player, index) => ({
    rank: index + 1,
    id: player.id,
    displayName: player.displayName,
    rating: player.rating,
    wins: player.wins,
    losses: player.losses,
    matchesPlayed: player.matchesPlayed,
  }));
}
