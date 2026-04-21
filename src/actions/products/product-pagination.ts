"use server";

import prisma from "@/lib/prisma";

interface PaginationOptions {
  page?: number;
  take?: number;
};

export const getPaginatedProductsWithImages = async ({
  page = 1,
  take = 12,
}: PaginationOptions) => {
  if(isNaN(Number(page))) page = 1;
  if(page < 1) page = 1;

  try {
    const products = await prisma.product.findMany({
      take: take,
      skip: (page - 1) * take,
      include: {
        ProductImage: {
          take: 2,
          select: {
            url: true,
            position: true,
          }
        }
      }
    });

    const totalCount = await prisma.product.count({});
    const totalPages = Math.ceil(totalCount / take);

    return {
      currentPage: page,
      totalPages: totalPages,
      products: products.map(product => ({
        ...product,
        contentId: product.contentId ?? "",
        images: product.ProductImage.sort((a, b) => a.position - b.position).map(image => image.url)
      })).sort((a, b) => a.position - b.position)
    };
  } catch (err) {
    console.log(err);
    throw new Error("No se pudieron cargar los productos");
  };
};
