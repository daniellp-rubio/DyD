"use server";

import prisma from "@/lib/prisma";

interface Options {
  categoryId: string;
  excludeSlug: string;
  take?: number;
}

export const getRelatedProducts = async ({ categoryId, excludeSlug, take = 4 }: Options) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        slug: { not: excludeSlug }
      },
      include: {
        ProductImage: {
          take: 2,
          select: { url: true }
        }
      },
      take
    });

    return products.map(p => ({
      ...p,
      images: p.ProductImage.map(i => i.url)
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
};
