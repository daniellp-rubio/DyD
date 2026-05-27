import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { runTrendAnalyst, type TrendOpportunity } from "@/agents/trend-analyst";
import { scrapeUrl } from "@/lib/scraping/firecrawl";

async function fetchRedditTrends(): Promise<string> {
  try {
    const url =
      "https://www.reddit.com/search.json?q=gadget%20apple%20colombia&limit=8&sort=relevance&t=month";
    const res = await fetch(url, {
      headers: { "User-Agent": "DYD-Trend-Scan/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const children: Array<{ data?: { title?: string; selftext?: string } }> =
      data?.data?.children ?? [];
    return children
      .map((p) => `${p.data?.title ?? ""}: ${(p.data?.selftext ?? "").slice(0, 150)}`)
      .join("\n");
  } catch {
    return "";
  }
}

export async function runTrendScan(): Promise<{ id: string; opportunities: TrendOpportunity[] }> {
  const redditText = await fetchRedditTrends();

  let scrapedText = "";
  if (process.env.FIRECRAWL_API_KEY) {
    try {
      const s = await scrapeUrl("https://listado.mercadolibre.com.co/electronica-audio-video");
      scrapedText = s.markdown.slice(0, 4000);
    } catch {
      scrapedText = "";
    }
  }

  const synthesis = await runTrendAnalyst({ redditText, scrapedText });

  const row = await prisma.trendReport.create({
    data: {
      source: "daily-scan",
      report: synthesis.report,
      opportunities: synthesis.opportunities as unknown as Prisma.InputJsonValue,
    },
  });

  return { id: row.id, opportunities: synthesis.opportunities };
}
