"use server";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

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
        slug: { not: excludeSlug },
      },
      include: {
        ProductImage: { take: 2, select: { url: true } },
      },
      take,
    });

    return products.map((p) => ({
      ...p,
      images: p.ProductImage.map((i) => i.url),
    }));
  } catch (error) {
    Logger.error({
      title: "Get Related Products Failed",
      message: "No se pudieron cargar productos relacionados",
      error,
    });
    return [];
  }
};
