"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { Product } from "@prisma/client";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(255),
  description: z.string(),
  price: z.coerce.number().min(0).transform(val => Number(val.toFixed(2))),
  inStock: z.coerce.number().min(0).transform(val => Number(val.toFixed(0))),
  position: z.coerce.number().min(0),
  categoryId: z.string().uuid(),
  tags: z.string()
});

export const createUpdateProduct = async(formData: FormData) => {
  const data = Object.fromEntries(formData);
  const productParsed = productSchema.safeParse(data);

  if (!productParsed.success) {
    console.log(productParsed.error);
    return { ok: false };
  };

  const product = productParsed.data;
  product.slug = product.slug.toLowerCase().replace(/ /g, "-").trim();

  const { id, ...rest } = product;


  try {
    const prismaTx = await prisma.$transaction(async(tx) => {
      let product: Product;
      const tagsArray = rest.tags.split(",").map(tag => tag.trim().toLowerCase());

      if (id) {
        product = await prisma.product.update({
          where: { id },
          data: {
            ...rest,
            tags: {
              set: tagsArray
            }
          }
        });
      } else {
        product = await prisma.product.create({
          data: {
            ...rest,
            tags: {
              set: tagsArray
            }
          }
        });
      };

      if(formData.getAll("images")) {
        
      };

      return {
        product
      };
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/product/${product.slug}`);
    revalidatePath(`/products/${product.slug}`);

    return {
      ok: true,
      product: prismaTx.product
    }
  } catch (error) {
    return {
      ok: false,
      message: "Revisar los logs, no se pudo actualizar/crear el producto"
    }
  }
};
