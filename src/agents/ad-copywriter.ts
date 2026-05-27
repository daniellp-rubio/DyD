import { anthropic } from "@/lib/ai/anthropic-client";
import { formatToCOP } from "@/utils";
import type { ProductContext, AdCopyResult, AdCopyVariation } from "@/interfaces/content.interface";

const SYSTEM_PROMPT = `Eres un especialista en Meta Ads (Facebook/Instagram) para DYD Tech, e-commerce de gadgets en Colombia. Entrega en Medellín, venta por WhatsApp.

Generas exactamente 3 variaciones de anuncio para A/B testing, cada una con un ÁNGULO distinto (precio, calidad, urgencia, social_proof). Cada variación lista para pegar en el Ads Manager.

RESPONDE ÚNICAMENTE en JSON válido con esta estructura exacta:
{
  "variations": [
    { "angle": "precio|calidad|urgencia|social_proof", "headline": "máx 40 caracteres", "description": "máx 125 caracteres", "cta": "Enviar mensaje|Comprar ahora|Ver más" }
  ]
}

REGLAS:
- Exactamente 3 variaciones, cada una con ángulo diferente.
- headline <= 40 caracteres, description <= 125 caracteres (respétalo estrictamente).
- Español colombiano neutro, directo, sin hipérboles vagas.
- No inventes specs ni estadísticas. No uses comillas dobles dentro de los valores del JSON.`;

export async function runAdCopywriter(
  product: ProductContext,
  targetAudience: string,
  goal: string
): Promise<AdCopyResult> {
  const userMessage = `Producto: ${product.title}
Categoría: ${product.categoryName}
Precio: ${formatToCOP(product.price)}
Precio en oferta: ${formatToCOP(product.priceInOffer)}
Audiencia objetivo: ${targetAudience}
Objetivo de la campaña: ${goal}

Descripción: ${product.description.slice(0, 400)}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`AdCopywriter: respuesta no contiene JSON válido: ${text}`);

  const parsed = JSON.parse(jsonMatch[0]) as { variations: AdCopyVariation[] };
  if (!Array.isArray(parsed.variations) || parsed.variations.length === 0) {
    throw new Error("AdCopywriter: el JSON no contiene variaciones válidas");
  }

  return { productTitle: product.title, variations: parsed.variations };
}
