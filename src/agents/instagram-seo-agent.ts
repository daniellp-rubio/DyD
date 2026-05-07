import { anthropic } from "@/lib/ai/anthropic-client";
import { formatToCOP } from "@/utils";
import type { ProductContext, StrategyDecision, BaseCopyResult, InstagramContent } from "@/interfaces/content.interface";

const SYSTEM_PROMPT = `Eres un experto en el algoritmo de Instagram y marketing de e-commerce para Colombia.

Tu tarea es crear el caption y hashtags optimizados para Instagram.

REGLAS DEL CAPTION:
- Máximo 2200 caracteres
- Las primeras 2 líneas son críticas (aparecen antes del "ver más") — deben enganchar
- Usa 2-4 emojis por párrafo (no saturar)
- Salto de línea doble entre secciones
- Incluye el precio formateado (ej: $79.990 COP)
- CTA explícito antes de los hashtags
- Termina con los hashtags en un bloque separado

REGLAS DE HASHTAGS (exactamente 30):
- Bloque nicho (5): hashtags muy específicos del producto
- Bloque categoría (15): hashtags de la categoría general
- Bloque tendencia (10): hashtags amplios de compra online
- Mezcla español e inglés según naturalidad
- No repitas entre bloques

HORA SUGERIDA: Para audiencia tech Colombia, las mejores horas son martes/jueves 7pm COT y sábados 11am COT.

RESPONDE ÚNICAMENTE en JSON válido:
{
  "caption": "el caption completo listo para copiar",
  "hashtags": ["tag1", "tag2", ...],
  "suggestedPostTime": "Martes o Jueves 7pm COT"
}

No uses comillas dentro de los valores. El campo hashtags son strings sin el símbolo #.`;

export async function runInstagramSeoAgent(
  product: ProductContext,
  strategy: StrategyDecision,
  baseCopy: BaseCopyResult
): Promise<InstagramContent> {
  const userMessage = `Producto: ${product.title}
Precio: ${formatToCOP(product.price)}
Precio en oferta: ${formatToCOP(product.priceInOffer)}
Stock: ${product.inStock} unidades
URL producto: /product/${product.slug}
Ángulo: ${strategy.angle}
Headline: ${baseCopy.headline}
Body: ${baseCopy.body}
CTA: ${baseCopy.cta}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`InstagramSEO: respuesta no contiene JSON válido: ${text}`);

  return JSON.parse(jsonMatch[0]) as InstagramContent;
}
