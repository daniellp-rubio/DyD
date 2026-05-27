import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isCronAuthorized } from "@/lib/cron-auth";
import { pullAndStoreInsights, optimizeCampaigns } from "@/services/meta-ads-manager";

async function handle() {
  if (!process.env.META_ACCESS_TOKEN || !process.env.META_AD_ACCOUNT_ID) {
    return NextResponse.json({ skipped: "Meta Ads no configurado" });
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await prisma.adInsight.findMany({
    where: { capturedAt: { gte: weekAgo } },
    distinct: ["campaignId"],
    select: { campaignId: true },
  });
  const campaignIds = rows.map((r) => r.campaignId);

  const stored = await pullAndStoreInsights(campaignIds);
  const actions = await optimizeCampaigns(campaignIds);

  return NextResponse.json({ campaigns: campaignIds.length, stored, actions });
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return handle();
}

export async function POST(req: NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return handle();
}
