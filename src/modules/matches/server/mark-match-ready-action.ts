"use server";

import { MatchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";

const markReadySchema = z.object({
  matchId: z.string().trim().min(1),
});

export async function markMatchReadyAction(formData: FormData) {
  await requireAdminUser();

  const parsed = markReadySchema.safeParse({
    matchId: formData.get("matchId"),
  });

  if (!parsed.success) {
    redirect("/matches/new?error=invalid_ready_payload");
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    include: {
      sides: {
        include: {
          players: {
            include: {
              heroPick: true,
            },
          },
        },
      },
    },
  });

  if (!match) {
    redirect("/matches/new?error=match_not_found");
  }

  if (match.status !== MatchStatus.DRAFT) {
    redirect(`/matches/${match.id}?error=match_not_draft`);
  }

  const allPlayers = match.sides.flatMap((side) => side.players);

  if (match.sides.length !== 2 || allPlayers.length === 0 || allPlayers.some((player) => !player.heroPick)) {
    redirect(`/matches/${match.id}?error=heroes_not_assigned`);
  }

  await prisma.match.update({
    where: { id: match.id },
    data: {
      status: MatchStatus.READY,
    },
  });

  revalidatePath("/");
  revalidatePath(`/matches/${match.id}`);
  redirect(`/matches/${match.id}?ready=1`);
}
