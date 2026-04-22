"use server";

import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/server/session";

const createPlayerSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  role: z.nativeEnum(UserRole).default(UserRole.PLAYER),
});

export async function createPlayerAction(formData: FormData) {
  await requireAdminUser();

  const parsed = createPlayerSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? UserRole.PLAYER,
  });

  if (!parsed.success) {
    redirect("/players?error=invalid_player_payload");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
        isActive: true,
        playerProfile: {
          create: {
            displayName: parsed.data.displayName,
            rating: 1000,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/players?error=email_exists");
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/players");
  revalidatePath("/leaderboard");
  redirect("/players?created=1");
}
