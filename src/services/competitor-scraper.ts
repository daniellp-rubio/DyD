import { scrapeUrl, type ScrapeResult } from "@/lib/scraping/firecrawl";
import { anthropic } from "@/lib/ai/anthropic-client";

// Scrapea URLs de competencia (Firecrawl) y sintetiza con Claude qué cambió
// y qué oportunidades emergen.

export async function scrapeAndSummarize(
  urls: string[]
): Promise<{ summary: string; scraped: number }> {
  const results = await Promise.allSettled(urls.map((u) => scrapeUrl(u)));

  const chunks: string[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      const value: ScrapeResult = r.value;
      chunks.push(`# ${value.title ?? value.url}\n${value.markdown.slice(0, 4000)}`);
    }
  }

  if (chunks.length === 0) {
    return { summary: "No se pudo scrapear ninguna fuente.", scraped: 0 };
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system:
      "Eres analista de mercado para DYD (gadgets réplica Apple en Colombia). Resume qué cambió esta semana en la competencia y 3 oportunidades concretas. Español colombiano, directo.",
    messages: [
      {
        role: "user",
        content: `Contenido scrapeado de la competencia:\n\n${chunks.join("\n\n---\n\n")}`,
      },
    ],
  });

  const summary = response.content[0].type === "text" ? response.content[0].text : "";
  return { summary, scraped: chunks.length };
}
