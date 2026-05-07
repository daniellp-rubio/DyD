"use server";

import prisma from "@/lib/prisma";
import type { ContentPostDetail } from "@/interfaces/content.interface";

export async function getContentPostById(id: string): Promise<ContentPostDetail | null> {
  const post = await prisma.contentPost.findUnique({
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

  if (!post) return null;

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
