import crypto from "node:crypto";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "unmatched_tier_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashToken(rawToken),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(rawToken),
    },
    include: {
      user: {
        include: {
          playerProfile: true,
        },
      },
    },
  });

  if (!session) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  if (!session.user || session.expiresAt.getTime() <= Date.now() || !session.user.isActive) {
    await prisma.session.delete({
      where: { id: session.id },
    });
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  await prisma.session.update({
    where: { id: session.id },
    data: {
      lastSeenAt: new Date(),
    },
  });

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    displayName: session.user.playerProfile?.displayName ?? session.user.email,
    playerProfileId: session.user.playerProfile?.id ?? null,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireUser();

  if (user.role !== UserRole.ADMIN) {
    redirect("/login?error=admin_required");
  }

  return user;
}
