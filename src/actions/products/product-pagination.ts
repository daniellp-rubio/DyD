"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

const optionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(60).default(12),
});

interface PaginationOptions {
  page?: number;
  take?: number;
}

export const getPaginatedProductsWithImages = async (options: PaginationOptions = {}) => {
  const { page, take } = optionsSchema.parse(options);

  try {
    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        take,
        skip: (page - 1) * take,
        orderBy: { position: "asc" },
        include: {
          ProductImage: { take: 2, select: { url: true, position: true } },
        },
      }),
      prisma.product.count(),
    ]);

    return {
      currentPage: page,
      totalPages: Math.ceil(totalCount / take),
      products: products.map((product) => ({
        ...product,
        contentId: product.contentId ?? "",
        images: product.ProductImage.sort((a, b) => a.position - b.position).map((i) => i.url),
      })),
    };
  } catch (error) {
    Logger.error({
      title: "Paginated Products Failed",
      message: "No se pudieron cargar productos paginados",
      error,
    });
    throw new Error("No se pudieron cargar los productos");
  }
};
