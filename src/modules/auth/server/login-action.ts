"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/modules/auth/server/session";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?error=invalid_credentials");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user || !user.isActive) {
    redirect("/login?error=invalid_credentials");
  }

  const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!isValidPassword) {
    redirect("/login?error=invalid_credentials");
  }

  await createSession(user.id);
  redirect("/");
}

