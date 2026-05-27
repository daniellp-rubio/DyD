import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { selectProductForToday } from "@/agents/orchestrator";
import { runAdCopywriter } from "@/agents/ad-copywriter";
import {
  createTrafficCampaign,
  createAdSetMedellin,
  getCampaignInsights,
  pauseEntity,
} from "@/lib/meta/campaigns";
import type { AdCopyResult } from "@/interfaces/content.interface";

// Crea una campaña (PAUSED) para un producto, con 3 variaciones de copy A/B.
export async function createCampaignForProduct(
  productId: string,
  dailyBudgetCents = 20000
): Promise<{ campaignId: string; adsetId: string; copy: AdCopyResult }> {
  const product = await selectProductForToday(productId);
  const copy = await runAdCopywriter(
    product,
    "jóvenes 18-30 en Medellín interesados en gadgets Apple",
    "tráfico al WhatsApp"
  );

  const campaign = await createTrafficCampaign(`DYD - ${product.title}`, dailyBudgetCents);
  const adset = await createAdSetMedellin(campaign.id);

  return { campaignId: campaign.id, adsetId: adset.id, copy };
}

// Pull de insights de cada campaña y guardado en DB.
export async function pullAndStoreInsights(campaignIds: string[]): Promise<number> {
  let stored = 0;
  for (const campaignId of campaignIds) {
    const rows = await getCampaignInsights(campaignId);
    for (const r of rows) {
      await prisma.adInsight.create({
        data: {
          campaignId,
          spend: Number(r.spend ?? 0),
          impressions: Number(r.impressions ?? 0),
          clicks: Number(r.clicks ?? 0),
          ctr: Number(r.ctr ?? 0),
          cpc: Number(r.cpc ?? 0),
          actions:
            r.actions == null
              ? Prisma.JsonNull
              : (r.actions as unknown as Prisma.InputJsonValue),
        },
      });
      stored++;
    }
  }
  return stored;
}

// Auto-pausa de campañas con CTR muy bajo.
export async function optimizeCampaigns(campaignIds: string[]): Promise<string[]> {
  const actions: string[] = [];
  for (const campaignId of campaignIds) {
    const rows = await getCampaignInsights(campaignId);
    const ctr = rows.length ? Number(rows[0].ctr ?? 0) : 0;
    if (ctr > 0 && ctr < 0.5) {
      await pauseEntity(campaignId);
      actions.push(`Pausada ${campaignId} por CTR bajo (${ctr})`);
    }
  }
  return actions;
}
