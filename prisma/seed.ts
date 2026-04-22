import bcrypt from "bcryptjs";
import { MatchMode, PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const defaultRuleConfigs = [
  {
    mode: MatchMode.ONE_VS_ONE,
    ratingDiffMin: 0,
    ratingDiffMax: 99,
    strongerMinPower: 1,
    strongerMaxPower: 100,
    weakerMinPower: 1,
    weakerMaxPower: 100,
    priority: 10,
  },
  {
    mode: MatchMode.ONE_VS_ONE,
    ratingDiffMin: 100,
    ratingDiffMax: 249,
    strongerMinPower: 1,
    strongerMaxPower: 75,
    weakerMinPower: 1,
    weakerMaxPower: 100,
    priority: 10,
  },
  {
    mode: MatchMode.ONE_VS_ONE,
    ratingDiffMin: 250,
    ratingDiffMax: 399,
    strongerMinPower: 1,
    strongerMaxPower: 60,
    weakerMinPower: 20,
    weakerMaxPower: 100,
    priority: 10,
  },
  {
    mode: MatchMode.ONE_VS_ONE,
    ratingDiffMin: 400,
    ratingDiffMax: 100000,
    strongerMinPower: 1,
    strongerMaxPower: 45,
    weakerMinPower: 35,
    weakerMaxPower: 100,
    priority: 10,
  },
  {
    mode: MatchMode.TWO_VS_TWO,
    ratingDiffMin: 0,
    ratingDiffMax: 149,
    strongerMinPower: 1,
    strongerMaxPower: 100,
    weakerMinPower: 1,
    weakerMaxPower: 100,
    priority: 10,
  },
  {
    mode: MatchMode.TWO_VS_TWO,
    ratingDiffMin: 150,
    ratingDiffMax: 299,
    strongerMinPower: 1,
    strongerMaxPower: 80,
    weakerMinPower: 1,
    weakerMaxPower: 100,
    priority: 10,
  },
  {
    mode: MatchMode.TWO_VS_TWO,
    ratingDiffMin: 300,
    ratingDiffMax: 499,
    strongerMinPower: 1,
    strongerMaxPower: 65,
    weakerMinPower: 15,
    weakerMaxPower: 100,
    priority: 10,
  },
  {
    mode: MatchMode.TWO_VS_TWO,
    ratingDiffMin: 500,
    ratingDiffMax: 100000,
    strongerMinPower: 1,
    strongerMaxPower: 50,
    weakerMinPower: 30,
    weakerMaxPower: 100,
    priority: 10,
  },
] as const;

const defaultHeroes: Array<{
  slug: string;
  name: string;
  tier: string;
  powerScore: number;
}> = [];

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      playerProfile: {
        create: {
          displayName: "Admin",
          rating: 1000,
        },
      },
    },
  });
}

async function seedHeroes() {
  for (const hero of defaultHeroes) {
    await prisma.hero.upsert({
      where: { slug: hero.slug },
      update: {
        name: hero.name,
        tier: hero.tier,
        powerScore: hero.powerScore,
        isActive: true,
      },
      create: {
        slug: hero.slug,
        name: hero.name,
        tier: hero.tier,
        powerScore: hero.powerScore,
        isActive: true,
      },
    });
  }
}

async function seedRuleConfigs() {
  for (const rule of defaultRuleConfigs) {
    const existing = await prisma.ruleConfig.findFirst({
      where: {
        mode: rule.mode,
        ratingDiffMin: rule.ratingDiffMin,
        ratingDiffMax: rule.ratingDiffMax,
      },
    });

    if (existing) {
      await prisma.ruleConfig.update({
        where: { id: existing.id },
        data: {
          strongerMinPower: rule.strongerMinPower,
          strongerMaxPower: rule.strongerMaxPower,
          weakerMinPower: rule.weakerMinPower,
          weakerMaxPower: rule.weakerMaxPower,
          isActive: true,
          priority: rule.priority,
        },
      });

      continue;
    }

    await prisma.ruleConfig.create({
      data: {
        mode: rule.mode,
        ratingDiffMin: rule.ratingDiffMin,
        ratingDiffMax: rule.ratingDiffMax,
        strongerMinPower: rule.strongerMinPower,
        strongerMaxPower: rule.strongerMaxPower,
        weakerMinPower: rule.weakerMinPower,
        weakerMaxPower: rule.weakerMaxPower,
        isActive: true,
        priority: rule.priority,
      },
    });
  }
}

async function main() {
  await seedAdminUser();
  await seedHeroes();
  await seedRuleConfigs();

  const heroCount = await prisma.hero.count();
  const ruleCount = await prisma.ruleConfig.count();

  console.log(`Seed completed. Heroes: ${heroCount}. Rule configs: ${ruleCount}.`);

  if (heroCount === 0) {
    console.log("Hero seed list is empty. Add real Unmatched heroes to prisma/seed.ts before first full use.");
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
