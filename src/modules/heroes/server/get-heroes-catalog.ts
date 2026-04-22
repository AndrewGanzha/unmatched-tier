import { prisma } from "@/lib/prisma";

export async function getHeroesCatalog() {
  const heroes = await prisma.hero.findMany({
    orderBy: [{ powerScore: "desc" }, { name: "asc" }],
  });

  return heroes.map((hero) => ({
    id: hero.id,
    slug: hero.slug,
    name: hero.name,
    tier: hero.tier,
    powerScore: hero.powerScore,
    imagePath: hero.imagePath,
    isActive: hero.isActive,
  }));
}
