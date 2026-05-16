import { anthropic } from "@/lib/ai/anthropic-client";
import type { ContentAngle } from "@prisma/client";

export interface VideoScript {
  motionPrompt: string;
}

const SYSTEM_PROMPT = `You are a video director creating motion prompts for product videos using AI (CogVideoX image-to-video model).

Generate a motion prompt that animates a product image with subtle, elegant movement suitable for Instagram Reels and TikTok.

RULES:
- Describe camera movement and product animation, not the product itself
- Keep it subtle: slow zoom, gentle pan, soft lighting changes, slight floating
- Max 70 words in English
- Do NOT describe people, text overlays, or background changes
- Ideal duration: 3-6 seconds

GOOD PATTERNS FOR GADGETS:
- slow gentle zoom in, product floating slightly, soft ambient light shimmer
- smooth camera pan left to right, product rotating slowly clockwise
- gentle dolly in, soft bokeh particles floating, product levitating

RESPOND ONLY as JSON:
{"motionPrompt": "..."}`;

const ANGLE_MOOD: Record<string, string> = {
  new_product: "excitement and desire, modern aesthetic",
  low_stock:   "urgency, premium feel",
  promotion:   "value, bright energetic",
  educational: "clean, informative, calm",
};

export async function runVideoScripterAgent(
  productTitle: string,
  categoryName: string,
  angle: ContentAngle | null
): Promise<VideoScript> {
  const mood = ANGLE_MOOD[angle ?? "new_product"] ?? "premium, desirable";

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Product: ${productTitle}\nCategory: ${categoryName}\nContent mood: ${mood}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`VideoScripter: respuesta inválida: ${text}`);

  return JSON.parse(jsonMatch[0]) as VideoScript;
}
