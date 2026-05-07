"use server";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export const getProductBySlug = async (slug: string) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug },
      include: {
        ProductImage: { select: { id: true, url: true, position: true, productId: true } },
        category: { select: { id: true, name: true } },
      },
    });
    if (!product) return null;
    return {
      ...product,
      images: product.ProductImage.sort((a, b) => a.position - b.position).map((i) => i.url),
    };
  } catch (error) {
    Logger.error({
      title: "Get Product By Slug Failed",
      message: "Error obteniendo producto",
      error,
    });
    return null;
  }
};
