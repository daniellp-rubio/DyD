import { anthropic } from "@/lib/ai/anthropic-client";

const SYSTEM_PROMPT = `Eres analista de producto para DYD Tech, e-commerce de gadgets/audio (réplicas Apple/Samsung) en Colombia. Audiencia 18-30, compra por impulso en redes, entrega en Medellín.

Recibes señales crudas (Reddit, listings de competencia). Tu tarea: detectar oportunidades concretas de producto para esta semana.

RESPONDE ÚNICAMENTE en JSON válido con esta estructura exacta:
{
  "report": "síntesis en markdown, máx 200 palabras",
  "opportunities": [
    { "product": "nombre/categoría", "whyRising": "dato concreto", "fitWithDyd": "encaje con DYD", "risk": "contra/riesgo", "actionThisWeek": "acción concreta" }
  ]
}

REGLAS:
- Máximo 5 oportunidades, ordenadas por viabilidad.
- Filtros: demostrable en 15s, precio impulso (<200k COP), margen >40%.
- No inventes estadísticas. No uses comillas dobles dentro de los valores del JSON.`;

export interface TrendOpportunity {
  product: string;
  whyRising: string;
  fitWithDyd: string;
  risk: string;
  actionThisWeek: string;
}

export interface TrendSynthesis {
  report: string;
  opportunities: TrendOpportunity[];
}

export async function runTrendAnalyst(inputs: {
  redditText?: string;
  scrapedText?: string;
}): Promise<TrendSynthesis> {
  const userMessage = `SEÑALES DE HOY:

REDDIT:
${inputs.redditText || "Sin datos."}

LISTINGS COMPETENCIA / MERCADO:
${inputs.scrapedText || "Sin datos."}

Si no hay datos externos, usa tu conocimiento del nicho colombiano pero mantén el realismo.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`TrendAnalyst: respuesta no contiene JSON válido: ${text}`);

  return JSON.parse(jsonMatch[0]) as TrendSynthesis;
}
