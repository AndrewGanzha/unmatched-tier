import { NextResponse } from "next/server";
import { getLeaderboard } from "@/modules/leaderboard/server/get-leaderboard";

export async function GET() {
  const leaderboard = await getLeaderboard();

  return NextResponse.json({
    ok: true,
    leaderboard,
  });
}
