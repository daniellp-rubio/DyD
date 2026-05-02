"use server";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export const getTopProductSlugs = async (take = 20): Promise<string[]> => {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true },
      take,
    });
    return products.map((p) => p.slug);
  } catch (error) {
    Logger.error({
      title: "Get Top Product Slugs Failed",
      message: "No se pudo cargar slugs",
      error,
    });
    return [];
  }
};
