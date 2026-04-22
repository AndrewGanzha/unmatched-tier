import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/modules/dashboard/server/get-dashboard-summary";

export async function GET() {
  const summary = await getDashboardSummary();

  return NextResponse.json({
    ok: true,
    summary,
  });
}
