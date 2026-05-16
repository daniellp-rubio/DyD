import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { selectProductForToday, resolveAngle } from "@/agents/orchestrator";
import { runContentStrategist } from "@/agents/content-strategist";
import { runCopywriter } from "@/agents/copywriter";
import { runInstagramSeoAgent } from "@/agents/instagram-seo-agent";
import { runTikTokSeoAgent } from "@/agents/tiktok-seo-agent";
import { runImageDesignerAgent } from "@/agents/image-designer-agent";
import type { ProductContext } from "@/interfaces/content.interface";
import type { ContentAngle } from "@prisma/client";

async function runAgentsForPost(
  contentPostId: string,
  product: ProductContext,
  suggestedAngle: ContentAngle
): Promise<void> {
  try {
    const strategy = await runContentStrategist(product, suggestedAngle);
    const baseCopy = await runCopywriter(product, strategy);

    const [instagram, tiktok, images] = await Promise.all([
      runInstagramSeoAgent(product, strategy, baseCopy),
      runTikTokSeoAgent(product, strategy, baseCopy),
      runImageDesignerAgent(product, strategy),
    ]);

    await prisma.$transaction([
      prisma.contentPost.update({
        where: { id: contentPostId },
        data: {
          status: "ready",
          angle: strategy.angle,
          baseCopy: `${baseCopy.headline}\n\n${baseCopy.body}\n\n${baseCopy.cta}`,
          baseImageUrl: product.primaryImageUrl,
          generatedAt: new Date(),
        },
      }),
      prisma.contentPlatformPost.create({
        data: {
          contentPostId,
          platform: "instagram",
          caption: instagram.caption,
          hashtags: instagram.hashtags,
          imageUrl: images.instagramUrl,
          suggestedPostTime: instagram.suggestedPostTime,
        },
      }),
      prisma.contentPlatformPost.create({
        data: {
          contentPostId,
          platform: "tiktok",
          caption: tiktok.caption,
          hashtags: tiktok.hashtags,
          imageUrl: images.tiktokUrl,
          hookLine: tiktok.hookLine,
          suggestedPostTime: tiktok.suggestedPostTime,
        },
      }),
    ]);

    Logger.info({
      title: "Content Pipeline Completed",
      message: `Post generado para: ${product.title} | Ángulo: ${strategy.angle}`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await prisma.contentPost.update({
      where: { id: contentPostId },
      data: { status: "failed", errorLog: errorMessage },
    });

    Logger.error({
      title: "Content Pipeline Failed",
      message: errorMessage,
      error: error as Error,
    });

    throw error;
  }
}

// Full synchronous pipeline — used by cron/API (fire-and-forget on that side)
export async function runContentPipeline(
  triggerSource: "cron" | "manual",
  triggeredBy?: string,
  productId?: string
): Promise<{ contentPostId: string }> {
  const product = await selectProductForToday(productId);
  const suggestedAngle = resolveAngle(product);

  const contentPost = await prisma.contentPost.create({
    data: {
      productId: product.id,
      triggerSource,
      triggeredBy,
      angle: suggestedAngle,
      status: "draft",
    },
  });

  await runAgentsForPost(contentPost.id, product, suggestedAngle);
  return { contentPostId: contentPost.id };
}

// Fire-and-forget: creates draft in DB immediately and runs agents in background.
// Returns the draft ID so the caller can show it in the UI right away.
export async function createDraftAsync(
  triggerSource: "cron" | "manual",
  triggeredBy?: string,
  productId?: string
): Promise<string> {
  const product = await selectProductForToday(productId);
  const suggestedAngle = resolveAngle(product);

  const contentPost = await prisma.contentPost.create({
    data: {
      productId: product.id,
      triggerSource,
      triggeredBy,
      angle: suggestedAngle,
      status: "draft",
    },
  });

  void runAgentsForPost(contentPost.id, product, suggestedAngle);
  return contentPost.id;
}
