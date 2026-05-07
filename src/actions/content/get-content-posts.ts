"use server";

import prisma from "@/lib/prisma";
import type { ContentPostSummary } from "@/interfaces/content.interface";

const PAGE_SIZE = 15;

export async function getContentPosts(page = 1): Promise<{
  posts: ContentPostSummary[];
  totalPages: number;
}> {
  const skip = (page - 1) * PAGE_SIZE;

  const [posts, total] = await Promise.all([
    prisma.contentPost.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true, slug: true } } },
    }),
    prisma.contentPost.count(),
  ]);

  return {
    posts: posts.map((p) => ({
      id: p.id,
      status: p.status,
      angle: p.angle,
      productTitle: p.product.title,
      productSlug: p.product.slug,
      generatedAt: p.generatedAt,
      createdAt: p.createdAt,
      triggerSource: p.triggerSource,
    })),
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}
