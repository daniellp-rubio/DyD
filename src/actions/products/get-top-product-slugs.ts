"use server";

import prisma from "@/lib/prisma";

export const getTopProductSlugs = async (take = 20): Promise<string[]> => {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true },
      take
    });
    return products.map(p => p.slug);
  } catch (error) {
    console.log(error);
    return [];
  }
};
