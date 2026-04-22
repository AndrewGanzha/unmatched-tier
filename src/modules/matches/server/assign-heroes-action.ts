"use server";

import { AssignmentSource, MatchMode, MatchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";

const assignHeroesSchema = z.object({
  matchId: z.string().trim().min(1),
});

function pickRandomHeroId(heroIds: string[]) {
  const randomIndex = Math.floor(Math.random() * heroIds.length);
  return heroIds[randomIndex];
}

export async function assignHeroesAction(formData: FormData) {
  await requireAdminUser();

  const parsed = assignHeroesSchema.safeParse({
    matchId: formData.get("matchId"),
  });

  if (!parsed.success) {
    redirect("/matches/new?error=invalid_assign_payload");
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    include: {
      sides: {
        orderBy: { sideIndex: "asc" },
        include: {
          players: {
            orderBy: { slotIndex: "asc" },
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

  if (match.sides.length !== 2 || match.sides.some((side) => side.players.length === 0)) {
    redirect(`/matches/${match.id}?error=incomplete_match_sides`);
  }

  const sideRatings = match.sides.map((side) => ({
    sideId: side.id,
    rating: side.seedRating,
  }));

  const strongerSide = [...sideRatings].sort((left, right) => right.rating - left.rating)[0];
  const weakerSide = [...sideRatings].sort((left, right) => left.rating - right.rating)[0];
  const ratingDiff = Math.abs(strongerSide.rating - weakerSide.rating);

  const ruleConfig = await prisma.ruleConfig.findFirst({
    where: {
      mode: match.mode,
      isActive: true,
      ratingDiffMin: { lte: ratingDiff },
      ratingDiffMax: { gte: ratingDiff },
    },
    orderBy: [{ priority: "desc" }, { ratingDiffMin: "asc" }],
  });

  if (!ruleConfig) {
    redirect(`/matches/${match.id}?error=rule_config_not_found`);
  }

  const usedHeroIds = new Set<string>();
  const heroAssignments: Array<{
    matchPlayerId: string;
    heroId: string;
  }> = [];

  for (const side of match.sides) {
    const isStrongerSide = side.id === strongerSide.sideId && strongerSide.sideId !== weakerSide.sideId;
    const isWeakerSide = side.id === weakerSide.sideId && strongerSide.sideId !== weakerSide.sideId;

    const minPower =
      match.mode === MatchMode.ONE_VS_ONE || match.mode === MatchMode.TWO_VS_TWO
        ? isStrongerSide
          ? ruleConfig.strongerMinPower
          : isWeakerSide
            ? ruleConfig.weakerMinPower
            : ruleConfig.strongerMinPower
        : ruleConfig.strongerMinPower;

    const maxPower =
      match.mode === MatchMode.ONE_VS_ONE || match.mode === MatchMode.TWO_VS_TWO
        ? isStrongerSide
          ? ruleConfig.strongerMaxPower
          : isWeakerSide
            ? ruleConfig.weakerMaxPower
            : ruleConfig.strongerMaxPower
        : ruleConfig.strongerMaxPower;

    const heroesPool = await prisma.hero.findMany({
      where: {
        isActive: true,
        powerScore: {
          gte: minPower,
          lte: maxPower,
        },
      },
      select: { id: true },
      orderBy: [{ powerScore: "desc" }, { name: "asc" }],
    });

    if (heroesPool.length === 0) {
      redirect(`/matches/${match.id}?error=heroes_pool_empty`);
    }

    for (const player of side.players) {
      const availableIds = heroesPool.map((hero) => hero.id);
      const uniqueIds = availableIds.filter((heroId) => !usedHeroIds.has(heroId));
      const chosenHeroId = pickRandomHeroId(uniqueIds.length > 0 ? uniqueIds : availableIds);

      usedHeroIds.add(chosenHeroId);
      heroAssignments.push({
        matchPlayerId: player.id,
        heroId: chosenHeroId,
      });
    }
  }

  await prisma.$transaction(
    heroAssignments.map((assignment) =>
      prisma.heroPick.upsert({
        where: { matchPlayerId: assignment.matchPlayerId },
        update: {
          heroId: assignment.heroId,
          assignedByRuleConfigId: ruleConfig.id,
          assignmentSource: AssignmentSource.AUTO,
        },
        create: {
          matchPlayerId: assignment.matchPlayerId,
          heroId: assignment.heroId,
          assignedByRuleConfigId: ruleConfig.id,
          assignmentSource: AssignmentSource.AUTO,
        },
      }),
    ),
  );

  revalidatePath("/");
  revalidatePath(`/matches/${match.id}`);
  revalidatePath("/heroes");
  redirect(`/matches/${match.id}?assigned=1`);
}
