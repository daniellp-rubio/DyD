import Anthropic from "@anthropic-ai/sdk";

const globalForAnthropic = globalThis as unknown as { _anthropic?: Anthropic };

export const anthropic =
  globalForAnthropic._anthropic ??
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic._anthropic = anthropic;
}
