import { runImagePromptAgent } from "./image-prompt-agent";
import { generateMarketingImage } from "@/lib/image-generation/together";
import { generateMarketingImageLocal } from "@/lib/image-generation/comfyui";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { buildInstagramUrl, buildTikTokUrl } from "@/lib/cloudinary/content-transforms";
import type { ProductContext, StrategyDecision, DesignedImages } from "@/interfaces/content.interface";

export async function runImageDesignerAgent(
  product: ProductContext,
  strategy: StrategyDecision,
): Promise<DesignedImages> {
  const prompt = await runImagePromptAgent(product, strategy);

  const imageSource =
    process.env.IMAGE_PROVIDER === "local"
      ? await generateMarketingImageLocal(prompt)
      : await generateMarketingImage(prompt);

  const uploadedUrl = await uploadToCloudinary(imageSource, "dyd-content");

  return {
    instagramUrl: buildInstagramUrl(uploadedUrl),
    tiktokUrl: buildTikTokUrl(uploadedUrl),
  };
}
