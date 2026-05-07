import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { selectProductForToday, resolveAngle } from "@/agents/orchestrator";
import { runContentStrategist } from "@/agents/content-strategist";
import { runCopywriter } from "@/agents/copywriter";
import { runInstagramSeoAgent } from "@/agents/instagram-seo-agent";
import { runTikTokSeoAgent } from "@/agents/tiktok-seo-agent";
import { runImageDesignerAgent } from "@/agents/image-designer-agent";
import type { PipelineResult } from "@/interfaces/content.interface";

export async function runContentPipeline(
  triggerSource: "cron" | "manual",
  triggeredBy?: string,
  productId?: string
): Promise<PipelineResult> {
  // Step 1: select product
  const product = await selectProductForToday(productId);
  const suggestedAngle = resolveAngle(product);

  // Create draft record
  const contentPost = await prisma.contentPost.create({
    data: {
      productId: product.id,
      triggerSource,
      triggeredBy,
      angle: suggestedAngle,
      status: "draft",
    },
  });

  try {
    // Steps 2-6: run agents (strategist + copywriter sequential; IG/TikTok/images parallel)
    const strategy = await runContentStrategist(product, suggestedAngle);
    const baseCopy = await runCopywriter(product, strategy);

    const [instagram, tiktok, images] = await Promise.all([
      runInstagramSeoAgent(product, strategy, baseCopy),
      runTikTokSeoAgent(product, strategy, baseCopy),
      runImageDesignerAgent(product, strategy),
    ]);

    // Step 7: persist results
    await prisma.$transaction([
      prisma.contentPost.update({
        where: { id: contentPost.id },
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
          contentPostId: contentPost.id,
          platform: "instagram",
          caption: instagram.caption,
          hashtags: instagram.hashtags,
          imageUrl: images.instagramUrl,
          suggestedPostTime: instagram.suggestedPostTime,
        },
      }),
      prisma.contentPlatformPost.create({
        data: {
          contentPostId: contentPost.id,
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
      message: `Post generado para: ${product.title} | Ángulo: ${strategy.angle} | Trigger: ${triggerSource}`,
    });

    return {
      contentPostId: contentPost.id,
      product,
      strategy,
      baseCopy,
      instagram,
      tiktok,
      images,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await prisma.contentPost.update({
      where: { id: contentPost.id },
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
