import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron-auth";
import { runTrendScan } from "@/services/trend-scan";

async function handle() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ skipped: "ANTHROPIC_API_KEY no configurada" });
  }
  const result = await runTrendScan();
  return NextResponse.json({
    trendReportId: result.id,
    opportunities: result.opportunities.length,
  });
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return handle();
}

export async function POST(req: NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return handle();
}
