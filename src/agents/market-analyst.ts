import { anthropic } from "@/lib/ai/anthropic-client";
import type { MarketIntelResult } from "@/interfaces/content.interface";

const SYSTEM_PROMPT = `Eres un estratega de marketing para DYD Tech, e-commerce de gadgets y audio (réplicas Apple/Samsung) en Colombia. Vendes por Instagram, TikTok y WhatsApp, con entrega en Medellín.

Recibes datos crudos de discusiones públicas (Reddit) sobre el nicho. Tu tarea: extraer inteligencia accionable.

RESPONDE ÚNICAMENTE en JSON válido con esta estructura exacta:
{
  "audienceLanguage": ["frase real 1", "frase real 2", "frase real 3"],
  "buyingObjections": ["objeción 1", "objeción 2"],
  "contentOpportunity": "un ángulo concreto que la competencia no está aprovechando bien (1-2 oraciones)",
  "recommendedCopy": "copy listo para publicar en el próximo post, con CTA a WhatsApp"
}

REGLAS:
- audienceLanguage: frases textuales o casi textuales que usa la audiencia, no paráfrasis genéricas.
- Si NO hay datos externos, usa tu conocimiento del nicho colombiano pero mantén el realismo.
- No inventes estadísticas. No uses comillas dobles dentro de los valores del JSON.
- Español colombiano neutro.`;

async function searchReddit(query: string): Promise<{ text: string; count: number }> {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
      query
    )}&limit=8&sort=relevance&t=year`;
    const res = await fetch(url, {
      headers: { "User-Agent": "DYD-Marketing-Agent/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { text: "", count: 0 };

    const data = await res.json();
    const children: Array<{ data?: { score?: number; title?: string; selftext?: string } }> =
      data?.data?.children ?? [];

    const text = children
      .map((p) => {
        const d = p.data ?? {};
        return `[${d.score ?? 0}pts] ${d.title ?? ""}: ${(d.selftext ?? "").slice(0, 200)}`;
      })
      .join("\n");

    return { text, count: children.length };
  } catch {
    // Reddit puede bloquear IPs de datacenter (403) o hacer timeout; degradamos sin romper.
    return { text: "", count: 0 };
  }
}

export async function runMarketAnalyst(category: string): Promise<MarketIntelResult> {
  const reddit = await searchReddit(category);

  const userMessage = `Nicho a analizar: "${category}"

DATOS DE REDDIT (${reddit.count} resultados):
${reddit.text || "Sin datos externos disponibles. Usa tu conocimiento del nicho de gadgets/réplicas en Colombia."}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`MarketAnalyst: respuesta no contiene JSON válido: ${text}`);

  const parsed = JSON.parse(jsonMatch[0]) as Omit<MarketIntelResult, "sourcesAnalyzed">;
  return { ...parsed, sourcesAnalyzed: reddit.count };
}
