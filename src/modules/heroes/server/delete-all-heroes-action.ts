"use server";

import path from "node:path";
import { unlink } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";

function resolveHeroImagePath(imagePath: string | null) {
  if (!imagePath || !imagePath.startsWith("/uploads/heroes/")) {
    return null;
  }

  return path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
}

async function removeHeroImage(imagePath: string | null) {
  const absolutePath = resolveHeroImagePath(imagePath);

  if (!absolutePath) {
    return;
  }

  try {
    await unlink(absolutePath);
  } catch {
    // Ignore missing files to keep bulk deletion idempotent.
  }
}

export async function deleteAllHeroesAction() {
  await requireAdminUser();

  const [heroPicksCount, heroes] = await Promise.all([
    prisma.heroPick.count(),
    prisma.hero.findMany({
      select: {
        imagePath: true,
      },
    }),
  ]);

  if (heroPicksCount > 0) {
    redirect("/heroes?error=heroes_in_use");
  }

  await prisma.hero.deleteMany();
  await Promise.all(heroes.map((hero) => removeHeroImage(hero.imagePath)));

  revalidatePath("/");
  revalidatePath("/heroes");
  redirect("/heroes?deleted_all=1");
}
