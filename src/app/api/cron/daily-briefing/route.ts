import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron-auth";
import { buildAndSendDailyBriefing } from "@/services/daily-briefing";

async function handle() {
  const message = await buildAndSendDailyBriefing();
  return NextResponse.json({ sent: true, preview: message.slice(0, 200) });
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return handle();
}

export async function POST(req: NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return handle();
}
