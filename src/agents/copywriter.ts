import { anthropic } from "@/lib/ai/anthropic-client";
import { formatToCOP } from "@/utils";
import type { ProductContext, StrategyDecision, BaseCopyResult } from "@/interfaces/content.interface";

const SYSTEM_PROMPT = `Eres un copywriter especializado en e-commerce tech para audiencia latinoamericana.

Tu tarea es crear el copy base de un post para redes sociales.

REGLAS:
- Español colombiano neutro (no muy local, entendible en toda LATAM)
- Directo y confiado, sin hipérboles vagas ("increíble", "amazing", "brutal")
- Usa datos concretos cuando los tengas
- El headline debe generar curiosidad o emoción en menos de 5 segundos de lectura
- El body desarrolla el beneficio principal (no las características técnicas)
- El cta es una instrucción directa y simple

RESPONDE ÚNICAMENTE en JSON válido:
{
  "headline": "frase de impacto máximo 60 caracteres",
  "body": "2-3 oraciones del beneficio principal",
  "cta": "1 oración de call to action"
}

NO menciones precios en el copy base. NO inventes specs. NO uses comillas dentro de los valores JSON.`;

export async function runCopywriter(
  product: ProductContext,
  strategy: StrategyDecision
): Promise<BaseCopyResult> {
  const userMessage = `Producto: ${product.title}
Categoría: ${product.categoryName}
Stock: ${product.inStock} unidades
Precio: ${formatToCOP(product.price)}
Precio en oferta: ${formatToCOP(product.priceInOffer)}

Ángulo estratégico: ${strategy.angle}
Emoción objetivo: ${strategy.targetEmotion}
Puntos clave a destacar:
${strategy.keySellingPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Descripción del producto: ${product.description.slice(0, 500)}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Copywriter: respuesta no contiene JSON válido: ${text}`);

  return JSON.parse(jsonMatch[0]) as BaseCopyResult;
}
