import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "unmatched-tier",
    timestamp: new Date().toISOString(),
  });
}
