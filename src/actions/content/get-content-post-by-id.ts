"use server";

import prisma from "@/lib/prisma";
import { checkVideoJob } from "@/lib/video-generation/local-api";
import type { ContentPostDetail, VideoStatus } from "@/interfaces/content.interface";

type PostWithRelations = NonNullable<Awaited<ReturnType<typeof fetchPost>>>;

// Video fields are not in the generated Prisma types until migration runs.
// This intersection type bridges the gap — remove after prisma generate.
type PostRow = PostWithRelations & {
  videoUrl: string | null;
  videoStatus: VideoStatus | null;
  videoJobId: string | null;
};

async function fetchPost(id: string) {
  return prisma.contentPost.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          category: true,
          ProductImage: { orderBy: { position: "asc" } },
        },
      },
      platforms: true,
    },
  });
}

async function updatePost(id: string, data: Record<string, unknown>): Promise<PostRow> {
  return prisma.contentPost.update({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: data as any,
    include: {
      product: {
        include: { category: true, ProductImage: { orderBy: { position: "asc" } } },
      },
      platforms: true,
    },
  }) as unknown as Promise<PostRow>;
}

function mapPost(post: PostRow): ContentPostDetail {
  const images = post.product.ProductImage.map((i) => i.url);
  const primaryImageUrl =
    post.product.ProductImage.find((i) => i.position === 2)?.url ?? images[0] ?? "";

  return {
    id: post.id,
    status: post.status,
    angle: post.angle,
    baseCopy: post.baseCopy,
    baseImageUrl: post.baseImageUrl,
    adminNotes: post.adminNotes,
    errorLog: post.errorLog,
    generatedAt: post.generatedAt,
    approvedAt: post.approvedAt,
    triggerSource: post.triggerSource,
    videoUrl: post.videoUrl,
    videoStatus: post.videoStatus,
    product: {
      id: post.product.id,
      title: post.product.title,
      slug: post.product.slug,
      price: post.product.price,
      priceInOffer: post.product.priceInOffer,
      inStock: post.product.inStock,
      description: post.product.description,
      tags: post.product.tags,
      contentId: post.product.contentId,
      categoryName: post.product.category.name,
      primaryImageUrl,
      allImageUrls: images,
    },
    platforms: post.platforms.map((p) => ({
      id: p.id,
      platform: p.platform,
      caption: p.caption,
      hashtags: p.hashtags,
      imageUrl: p.imageUrl,
      hookLine: p.hookLine,
      suggestedPostTime: p.suggestedPostTime,
    })),
  };
}

export async function getContentPostById(id: string): Promise<ContentPostDetail | null> {
  const raw = await fetchPost(id);
  if (!raw) return null;

  let post = raw as PostRow;

  // Auto-check FastAPI when video is generating — updates DB so next render shows final state.
  if (post.videoStatus === "generating" && post.videoJobId) {
    try {
      const job = await checkVideoJob(post.videoJobId);

      if (job.status === "done" && job.video_url) {
        post = await updatePost(id, { videoStatus: "ready", videoUrl: job.video_url, videoJobId: null });
      } else if (job.status === "failed") {
        post = await updatePost(id, { videoStatus: "failed", videoJobId: null });
      }
    } catch {
      // FastAPI offline or job not found — keep current status, poller will retry.
    }
  }

  return mapPost(post);
}
