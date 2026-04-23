import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import prismaClient from "@prisma/client";

const { MatchMode, PrismaClient, UserRole } = prismaClient;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set for prisma seed.");
}

const adapter = new PrismaBetterSqlite3(
  { url: connectionString },
  { timestampFormat: "unixepoch-ms" },
);

const prisma = new PrismaClient({ adapter });

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
];

const defaultHeroes = [
  { slug: "medusa", name: "Medusa", tier: "S", combatType: "RANGED", powerScore: 96 },
  { slug: "little-red", name: "Little Red Riding Hood", tier: "S", combatType: "RANGED", powerScore: 94 },
  { slug: "sun-wukong", name: "Sun Wukong", tier: "S", combatType: "MELEE", powerScore: 92 },
  { slug: "alice", name: "Alice", tier: "A", combatType: "MELEE", powerScore: 88 },
  { slug: "beowulf", name: "Beowulf", tier: "A", combatType: "MELEE", powerScore: 86 },
  { slug: "dracula", name: "Dracula", tier: "A", combatType: "MELEE", powerScore: 84 },
  { slug: "sinbad", name: "Sinbad", tier: "A", combatType: "RANGED", powerScore: 82 },
  { slug: "arthur", name: "King Arthur", tier: "B", combatType: "MELEE", powerScore: 74 },
  { slug: "bigfoot", name: "Bigfoot", tier: "B", combatType: "RANGED", powerScore: 72 },
  { slug: "bloody-mary", name: "Bloody Mary", tier: "B", combatType: "MELEE", powerScore: 70 },
  { slug: "annie-christmas", name: "Annie Christmas", tier: "B", combatType: "RANGED", powerScore: 68 },
  { slug: "achilles", name: "Achilles", tier: "C", combatType: "MELEE", powerScore: 60 },
  { slug: "yennenga", name: "Yennenga", tier: "C", combatType: "RANGED", powerScore: 58 },
  { slug: "sherlock-holmes", name: "Sherlock Holmes", tier: "C", combatType: "RANGED", powerScore: 56 },
  { slug: "jekyll-hyde", name: "Dr. Jekyll & Mr. Hyde", tier: "D", combatType: "MELEE", powerScore: 46 },
  { slug: "invisible-man", name: "Invisible Man", tier: "D", combatType: "MELEE", powerScore: 42 },
];

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { playerProfile: true },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    if (!existingUser.playerProfile) {
      await prisma.playerProfile.create({
        data: {
          userId: existingUser.id,
          displayName: "Admin",
          rating: 1000,
        },
      });
    }

    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const createdUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!createdUser) {
    throw new Error("Failed to create admin user during seed.");
  }

  await prisma.playerProfile.create({
    data: {
      userId: createdUser.id,
      displayName: "Admin",
      rating: 1000,
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
        combatType: hero.combatType,
        powerScore: hero.powerScore,
        isActive: true,
      },
      create: {
        slug: hero.slug,
        name: hero.name,
        tier: hero.tier,
        combatType: hero.combatType,
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
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
