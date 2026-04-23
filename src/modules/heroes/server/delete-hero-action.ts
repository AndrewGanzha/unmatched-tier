"use server";

import path from "node:path";
import { unlink } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";

const deleteHeroSchema = z.object({
  heroId: z.string().trim().min(1),
});

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
    // Ignore missing files to keep deletion idempotent.
  }
}

export async function deleteHeroAction(formData: FormData) {
  await requireAdminUser();

  const parsed = deleteHeroSchema.safeParse({
    heroId: formData.get("heroId"),
  });

  if (!parsed.success) {
    redirect("/heroes?error=invalid_delete_payload");
  }

  const hero = await prisma.hero.findUnique({
    where: { id: parsed.data.heroId },
    include: {
      _count: {
        select: {
          heroPicks: true,
        },
      },
    },
  });

  if (!hero) {
    redirect("/heroes?error=hero_not_found");
  }

  if (hero._count.heroPicks > 0) {
    redirect("/heroes?error=hero_in_use");
  }

  await prisma.hero.delete({
    where: { id: hero.id },
  });

  await removeHeroImage(hero.imagePath);

  revalidatePath("/");
  revalidatePath("/heroes");
  redirect("/heroes?deleted=1");
}
