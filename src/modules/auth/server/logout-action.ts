"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/modules/auth/server/session";

export async function logoutAction() {
  await clearSession();
  redirect("/login?logged_out=1");
}
