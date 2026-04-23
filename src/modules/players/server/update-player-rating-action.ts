"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";

const updatePlayerRatingSchema = z.object({
  playerId: z.string().trim().min(1),
  rating: z.coerce.number().int().min(0).max(5000),
});

export async function updatePlayerRatingAction(formData: FormData) {
  await requireAdminUser();

  const parsed = updatePlayerRatingSchema.safeParse({
    playerId: formData.get("playerId"),
    rating: formData.get("rating"),
  });

  if (!parsed.success) {
    redirect("/players?error=invalid_rating_payload");
  }

  const player = await prisma.playerProfile.findUnique({
    where: { id: parsed.data.playerId },
    select: { id: true },
  });

  if (!player) {
    redirect("/players?error=player_not_found");
  }

  await prisma.playerProfile.update({
    where: { id: player.id },
    data: {
      rating: parsed.data.rating,
    },
  });

  revalidatePath("/");
  revalidatePath("/players");
  revalidatePath(`/players/${player.id}`);
  revalidatePath("/leaderboard");
  redirect(`/players/${player.id}?rating_updated=1`);
}
