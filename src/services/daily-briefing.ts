import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

// Construye el briefing diario de DYD y lo manda a Discord vía el Logger
// (transporte Discord ya existente).

export async function buildAndSendDailyBriefing(): Promise<string> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [published, winners, insights, trend] = await Promise.all([
    prisma.contentPost.count({ where: { publishedAt: { gte: since } } }),
    prisma.videoAnalysis.count({ where: { verdict: "winner", createdAt: { gte: since } } }),
    prisma.adInsight.findMany({ where: { capturedAt: { gte: since } } }),
    prisma.trendReport.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const spend = insights.reduce((sum, i) => sum + i.spend, 0);

  const message = [
    `📊 Publicados (24h): ${published}`,
    `🔥 Videos winner (24h): ${winners}`,
    `💰 Ad spend (24h): ${spend.toFixed(0)} COP · ${insights.length} filas de insight`,
    trend
      ? `📈 Última tendencia:\n${trend.report.slice(0, 400)}`
      : "📈 Sin reporte de tendencias aún",
  ].join("\n");

  Logger.info({ title: "DYD — Briefing diario", message });
  return message;
}
