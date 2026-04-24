import { prisma } from "@/lib/prisma";

export async function getPlayers() {
  const players = await prisma.playerProfile.findMany({
    include: { user: true },
    orderBy: [{ rating: "desc" }, { displayName: "asc" }],
  });

  return players.flatMap((player) => {
    if (!player.user) {
      return [];
    }

    return [
      {
        id: player.id,
        displayName: player.displayName,
        email: player.user.email,
        role: player.user.role,
        isActive: player.user.isActive,
        rating: player.rating,
        wins: player.wins,
        losses: player.losses,
        matchesPlayed: player.matchesPlayed,
      },
    ];
  });
}
