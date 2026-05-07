import { anthropic } from "@/lib/ai/anthropic-client";
import { formatToCOP } from "@/utils";
import type { ProductContext, StrategyDecision, BaseCopyResult, TikTokContent } from "@/interfaces/content.interface";

const SYSTEM_PROMPT = `Eres un experto en el algoritmo de TikTok para e-commerce, especializado en contenido tech Colombia.

Tu tarea es crear el hook, caption y hashtags optimizados para TikTok.

REGLAS DEL HOOK (primera línea del video):
- Máximo 10 palabras
- Debe generar curiosidad, sorpresa o urgencia en menos de 3 segundos
- Formatos efectivos: pregunta, dato sorprendente, afirmación polémica
- Ejemplos: "¿Sabías que este error te cuesta dinero?", "El gadget que nadie te dijo que necesitas"

REGLAS DEL CAPTION:
- Máximo 150 caracteres (lo visible sin truncar)
- Tono informal, como si le hablaras a la cámara
- Incluir el precio si el ángulo es promotion o low_stock
- Terminar con un emoji relevante

REGLAS DE HASHTAGS (máximo 5):
- Preferir hashtags trending diferentes a los de Instagram
- Mix: 1-2 de nicho, 2-3 generales trending
- No repetir los de Instagram
- Strings sin el símbolo #

RESPONDE ÚNICAMENTE en JSON válido:
{
  "hookLine": "la primera línea del video",
  "caption": "el caption corto para TikTok",
  "hashtags": ["tag1", "tag2", "tag3"],
  "suggestedPostTime": "Lunes/Miércoles/Viernes 8pm COT"
}`;

export async function runTikTokSeoAgent(
  product: ProductContext,
  strategy: StrategyDecision,
  baseCopy: BaseCopyResult
): Promise<TikTokContent> {
  const userMessage = `Producto: ${product.title}
Precio: ${formatToCOP(product.price)}
Precio en oferta: ${formatToCOP(product.priceInOffer)}
Stock: ${product.inStock} unidades
Ángulo: ${strategy.angle}
Copy base — Headline: ${baseCopy.headline}
Copy base — Body: ${baseCopy.body}
Copy base — CTA: ${baseCopy.cta}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`TikTokSEO: respuesta no contiene JSON válido: ${text}`);

  return JSON.parse(jsonMatch[0]) as TikTokContent;
}
