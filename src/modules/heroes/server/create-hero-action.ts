"use server";

import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const createHeroSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120),
  tier: z.enum(["S", "A", "B", "C", "D"]),
  combatType: z.enum(["MELEE", "RANGED"]),
  powerScore: z.coerce.number().int().min(1).max(10000),
  isActive: z.union([z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()]).optional(),
});

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function getFileExtension(fileName: string, mimeType: string) {
  const fromName = path.extname(fileName).toLowerCase();

  if (fromName) {
    return fromName;
  }

  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";

  return "";
}

async function saveHeroImage(file: File | null, heroSlug: string) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    redirect("/heroes?error=invalid_image_type");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    redirect("/heroes?error=image_too_large");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "heroes");
  await mkdir(uploadsDir, { recursive: true });

  const extension = getFileExtension(file.name, file.type);
  const uniqueSuffix = crypto.randomBytes(8).toString("hex");
  const fileName = `${heroSlug}-${uniqueSuffix}${extension || ".bin"}`;
  const targetPath = path.join(uploadsDir, fileName);
  const arrayBuffer = await file.arrayBuffer();

  await writeFile(targetPath, Buffer.from(arrayBuffer));

  return `/uploads/heroes/${fileName}`;
}

export async function createHeroAction(formData: FormData) {
  await requireAdminUser();

  const parsed = createHeroSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    tier: formData.get("tier"),
    combatType: formData.get("combatType"),
    powerScore: formData.get("powerScore"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    redirect("/heroes?error=invalid_hero_payload");
  }

  const slug = normalizeSlug(parsed.data.slug || parsed.data.name);

  if (!slug) {
    redirect("/heroes?error=invalid_slug");
  }

  const imageFile = formData.get("image");
  const imagePath = imageFile instanceof File ? await saveHeroImage(imageFile, slug) : null;

  try {
    await prisma.hero.create({
      data: {
        name: parsed.data.name,
        slug,
        tier: parsed.data.tier,
        combatType: parsed.data.combatType,
        powerScore: parsed.data.powerScore,
        imagePath,
        isActive: parsed.data.isActive !== "false",
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/heroes?error=hero_slug_exists");
    }

    throw error;
  }

  revalidatePath("/heroes");
  revalidatePath("/");
  redirect("/heroes?created=1");
}
