import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { MatchMode, PrismaClient, UserRole } from "@prisma/client";

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
] as const;

type SeedHero = {
  slug: string;
  name: string;
  tier: "S" | "A" | "B" | "C" | "D";
  combatType: "MELEE" | "RANGED";
  powerScore: number;
  imagePath: string;
};

const heroSeedDefaults: Array<Omit<SeedHero, "imagePath">> = [
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

const heroSlugAliases = new Map<string, string>([
  ["king-arthur", "arthur"],
  ["jekyll-and-hyde", "jekyll-hyde"],
  ["sinbad", "sinbad"],
  ["sindbad", "sinbad"],
  ["yennega", "yennenga"],
  ["yennenga", "yennenga"],
  ["bloody-mary", "bloody-mary"],
  ["blood-mary", "bloody-mary"],
]);

const heroDefaultsBySlug = new Map(heroSeedDefaults.map((hero) => [hero.slug, hero]));

function normalizeHeroSlug(rawSlug: string) {
  const normalized = rawSlug
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\d+-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return heroSlugAliases.get(normalized) ?? normalized;
}

function toTitleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractHeroImageFiles() {
  const heroesDir = path.join(process.cwd(), "public", "uploads", "heroes");

  if (!fs.existsSync(heroesDir)) {
    return [];
  }

  return fs
    .readdirSync(heroesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^\d+-.*\.(png|jpe?g|webp)$/i.test(entry.name))
    .map((entry) => entry.name);
}

function buildSeedHeroes(): SeedHero[] {
  return extractHeroImageFiles()
    .map((fileName) => {
      const derivedSlug = normalizeHeroSlug(fileName);

      const baseHero = heroDefaultsBySlug.get(derivedSlug);

      return {
        slug: derivedSlug,
        name: baseHero?.name ?? toTitleCase(derivedSlug),
        tier: baseHero?.tier ?? "C",
        combatType: baseHero?.combatType ?? "MELEE",
        powerScore: baseHero?.powerScore ?? 50,
        imagePath: `/uploads/heroes/${fileName}`,
      } satisfies SeedHero;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

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
  const heroes = buildSeedHeroes();

  for (const hero of heroes) {
    await prisma.hero.upsert({
      where: { slug: hero.slug },
      update: {
        name: hero.name,
        tier: hero.tier,
        combatType: hero.combatType,
        powerScore: hero.powerScore,
        imagePath: hero.imagePath,
        isActive: true,
      },
      create: {
        slug: hero.slug,
        name: hero.name,
        tier: hero.tier,
        combatType: hero.combatType,
        powerScore: hero.powerScore,
        imagePath: hero.imagePath,
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
    console.log("Hero seed list is empty. Check public/uploads/heroes before running seed.");
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
