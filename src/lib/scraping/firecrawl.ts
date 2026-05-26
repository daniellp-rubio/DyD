// Firecrawl — scraping de páginas (competencia, listings) a markdown limpio.
// API v1: POST {base}/v1/scrape -> { success, data: { markdown, metadata } }
// Lee process.env directo (no @/lib/env) para no disparar validación en build.

const DEFAULT_BASE = "https://api.firecrawl.dev";

function firecrawlKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY no configurada");
  return key;
}

export interface ScrapeResult {
  url: string;
  markdown: string;
  title?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const base = process.env.FIRECRAWL_BASE_URL || DEFAULT_BASE;
  const res = await fetch(`${base}/v1/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, formats: ["markdown"] }),
  });

  if (!res.ok) {
    throw new Error(`firecrawl scrape falló (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as {
    success?: boolean;
    data?: { markdown?: string; metadata?: { title?: string } };
  };

  return {
    url,
    markdown: data.data?.markdown ?? "",
    title: data.data?.metadata?.title,
  };
}
