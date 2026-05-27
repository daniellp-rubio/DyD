"use server";

import { auth } from "@/auth-config";
import { runMarketAnalyst } from "@/agents/market-analyst";
import type { MarketIntelActionResult } from "@/interfaces/content.interface";

export async function runMarketIntel(category?: string): Promise<MarketIntelActionResult> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { ok: false, message: "No autorizado" };
  }

  try {
    const data = await runMarketAnalyst(category?.trim() || "airpods replica colombia");
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error en el análisis de mercado",
    };
  }
}
