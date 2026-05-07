import Together from "together-ai";

const MODEL = "black-forest-labs/FLUX.1-schnell-Free";

export async function generateMarketingImage(prompt: string): Promise<string> {
  const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

  const response = await together.images.generate({
    model: MODEL,
    prompt,
    width: 1024,
    height: 1024,
    steps: 4,
    n: 1,
    response_format: "base64",
  });

  const image = response.data[0] as { b64_json?: string; url?: string };

  if (image.b64_json) {
    return `data:image/png;base64,${image.b64_json}`;
  }

  if (image.url) {
    return image.url;
  }

  throw new Error("Together AI: respuesta sin imagen");
}
