"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Product } from "@prisma/client";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

const productSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(3).max(255),
  slug: z.string().trim().min(3).max(255),
  description: z.string().trim().min(1).max(5000),
  price: z.coerce.number().min(0).transform((v) => Number(v.toFixed(2))),
  inStock: z.coerce.number().int().min(0),
  position: z.coerce.number().int().min(0),
  categoryId: z.string().uuid(),
  tags: z.string().max(1000),
});

export const createUpdateProduct = async (formData: FormData) => {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return { ok: false, message: "No autorizado" } as const;
  }

  const data = Object.fromEntries(formData);
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, message: "Datos inválidos" } as const;
  }

  const product = parsed.data;
  product.slug = product.slug.toLowerCase().replace(/\s+/g, "-").trim();

  const { id, tags, ...rest } = product;
  const tagsArray = tags
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  try {
    let saved: Product;
    if (id) {
      saved = await prisma.product.update({
        where: { id },
        data: { ...rest, tags: { set: tagsArray } },
      });
    } else {
      saved = await prisma.product.create({
        data: { ...rest, tags: { set: tagsArray } },
      });
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/product/${saved.slug}`);
    revalidatePath(`/products/${saved.slug}`);

    return { ok: true, product: saved } as const;
  } catch (error) {
    Logger.error({
      title: "Create/Update Product Failed",
      message: "No se pudo actualizar/crear el producto",
      error,
    });
    return { ok: false, message: "No se pudo actualizar/crear el producto" } as const;
  }
};
