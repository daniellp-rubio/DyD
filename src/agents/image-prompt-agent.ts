import Anthropic from "@anthropic-ai/sdk";
import type { ProductContext, StrategyDecision } from "@/interfaces/content.interface";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `Eres director creativo de DYD TECH, marca colombiana de accesorios tech premium.
Identidad visual: fondo muy oscuro casi negro (#1C1C1C), acentos naranja (#FF5722), estética tech moderna y limpia.
Generas prompts de imagen en inglés, concisos y detallados. Las imágenes no llevan texto. Estilo fotorrealista.`;

export async function runImagePromptAgent(
  product: ProductContext,
  strategy: StrategyDecision
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 250,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Genera un prompt de imagen para publicidad en redes sociales.

Producto: ${product.title}
Categoría: ${product.categoryName}
Ángulo: ${strategy.angle}
Puntos clave: ${strategy.keySellingPoints.join(", ")}
Emoción objetivo: ${product.description.slice(0, 120)}

Requisitos:
- Fondo oscuro (#1C1C1C), sin texto en la imagen
- El producto es el protagonista absoluto
- Iluminación dramatic con destellos naranja
- Formato cuadrado 1:1, composición centrada
- Calidad de fotografía de producto premium

Devuelve SOLO el prompt en inglés, sin explicaciones.`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === "text" ? content.text.trim() : "";
}
