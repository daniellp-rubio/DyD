"use server";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export const getStockBySlug = async (slug: string): Promise<number> => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug },
      select: { inStock: true },
    });
    return product?.inStock ?? 0;
  } catch (error) {
    Logger.error({
      title: "Get Stock Failed",
      message: "No se pudo obtener stock",
      error,
    });
    return 0;
  }
};
