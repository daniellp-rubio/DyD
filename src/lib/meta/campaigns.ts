import { graphGet, graphPost, metaAdAccount } from "@/lib/meta/client";

// Meta Marketing API — creación de campañas/adsets + insights + optimización.
// Objetivos ODAX (los legacy ya no funcionan): OUTCOME_TRAFFIC, etc.

export interface MetaEntityId {
  id: string;
}

export interface MetaInsightRow {
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  actions?: { action_type: string; value: string }[];
}

interface MetaInsightsResponse {
  data: MetaInsightRow[];
}

export async function createTrafficCampaign(
  name: string,
  dailyBudgetCents: number
): Promise<MetaEntityId> {
  return graphPost<MetaEntityId>(`${metaAdAccount()}/campaigns`, {
    name,
    objective: "OUTCOME_TRAFFIC",
    status: "PAUSED", // siempre PAUSED al crear; activar tras revisión humana
    special_ad_categories: [],
    daily_budget: dailyBudgetCents,
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
  });
}

export async function createAdSetMedellin(
  campaignId: string,
  dailyBudgetCents = 5000
): Promise<MetaEntityId> {
  return graphPost<MetaEntityId>(`${metaAdAccount()}/adsets`, {
    name: "DYD - Medellin 18-30",
    campaign_id: campaignId,
    status: "PAUSED",
    daily_budget: dailyBudgetCents,
    optimization_goal: "LINK_CLICKS",
    billing_event: "IMPRESSIONS",
    targeting: {
      geo_locations: { cities: [{ key: "773867", name: "Medellin" }] },
      age_min: 18,
      age_max: 30,
      publisher_platforms: ["facebook", "instagram"],
      instagram_positions: ["stream", "story", "reels"],
    },
  });
}

export async function getCampaignInsights(campaignId: string): Promise<MetaInsightRow[]> {
  const res = await graphGet<MetaInsightsResponse>(`${campaignId}/insights`, {
    fields: "spend,impressions,clicks,ctr,cpc,actions",
    date_preset: "today",
  });
  return res.data ?? [];
}

export async function pauseEntity(id: string): Promise<MetaEntityId> {
  return graphPost<MetaEntityId>(id, { status: "PAUSED" });
}

export async function setEntityBudget(id: string, dailyBudgetCents: number): Promise<MetaEntityId> {
  return graphPost<MetaEntityId>(id, { daily_budget: dailyBudgetCents });
}
