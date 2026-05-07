import { anthropic } from "@/lib/ai/anthropic-client";
import { formatToCOP } from "@/utils";
import type { ProductContext, StrategyDecision } from "@/interfaces/content.interface";
import type { ContentAngle } from "@prisma/client";

const SYSTEM_PROMPT = `Eres un estratega de contenido para redes sociales de DYD Tech, una tienda de gadgets y audio premium en Colombia.

Tu tarea es analizar el producto dado y decidir el ángulo de contenido óptimo para maximizar ventas.

ÁNGULOS DISPONIBLES:
- new_product: destacar características únicas, despertar deseo
- low_stock: urgencia real por pocas unidades disponibles
- promotion: comparar precio normal vs precio oferta, enfatizar ahorro
- educational: enseñar algo útil relacionado con el producto, construir autoridad

AUDIENCIA: Adultos jóvenes 18-35, Colombia, interés en gadgets Apple/Samsung, precio-sensibles, compran por impulso en redes.

RESPONDE ÚNICAMENTE en JSON válido con esta estructura:
{
  "angle": "new_product|low_stock|promotion|educational",
  "rationale": "por qué este ángulo (1 oración)",
  "keySellingPoints": ["punto 1", "punto 2", "punto 3"],
  "targetEmotion": "urgencia|deseo|educación|confianza"
}

RESTRICCIONES: No inventes características. Usa solo lo provisto. No uses comillas dentro de los strings de JSON.`;

export async function runContentStrategist(
  product: ProductContext,
  suggestedAngle: ContentAngle
): Promise<StrategyDecision> {
  const userMessage = `Producto para analizar:
Nombre: ${product.title}
Categoría: ${product.categoryName}
Precio: ${formatToCOP(product.price)}
Precio en oferta: ${formatToCOP(product.priceInOffer)}
Stock disponible: ${product.inStock} unidades
Tags: ${product.tags.join(", ")}
Descripción: ${product.description.slice(0, 400)}

Ángulo sugerido por el sistema: ${suggestedAngle}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`ContentStrategist: respuesta no contiene JSON válido: ${text}`);

  return JSON.parse(jsonMatch[0]) as StrategyDecision;
}
