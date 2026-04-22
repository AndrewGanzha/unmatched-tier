import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getActingUserId() {
  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (admin) {
    return admin.id;
  }

  const anyUser = await prisma.user.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (anyUser) {
    return anyUser.id;
  }

  const created = await prisma.user.create({
    data: {
      email: "local-admin@unmatched-tier.dev",
      passwordHash: await bcrypt.hash("local-admin-bootstrap", 10),
      role: UserRole.ADMIN,
      isActive: true,
      playerProfile: {
        create: {
          displayName: "Local Admin",
          rating: 1000,
        },
      },
    },
  });

  return created.id;
}
