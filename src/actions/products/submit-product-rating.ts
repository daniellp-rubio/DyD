"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import type { SubmitReviewResult } from "@/interfaces";

const reviewSchema = z.object({
  productId: z.string().uuid(),
  slug: z.string().min(1),
  rating: z.number().int().min(1, "Selecciona de 1 a 5 estrellas").max(5),
  comment: z
    .string()
    .trim()
    .max(1000, "El comentario no puede superar los 1000 caracteres")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export async function submitProductRating(input: {
  productId: string;
  slug: string;
  rating: number;
  comment?: string;
}): Promise<SubmitReviewResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Debes iniciar sesión para dejar una reseña." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { productId, slug, rating, comment } = parsed.data;
  const userId = session.user.id;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) return { ok: false, message: "Producto no encontrado." };

    // Comprador verificado = tiene este producto en una orden pagada.
    const paidItem = await prisma.orderItem.findFirst({
      where: { productId, order: { userId, isPaid: true } },
      select: { id: true },
    });

    const verifiedBuyer = Boolean(paidItem);
    const status = verifiedBuyer ? "approved" : "pending";

    await prisma.productRatings.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, rating, comment, verifiedBuyer, status },
      update: { rating, comment, verifiedBuyer, status },
    });

    revalidatePath(`/product/${slug}`);
    revalidatePath("/admin/reviews");

    return {
      ok: true,
      status,
      message: verifiedBuyer
        ? "¡Gracias! Tu reseña ya está publicada."
        : "¡Gracias! Tu reseña fue enviada y se publicará tras una breve revisión.",
    };
  } catch (error) {
    Logger.error({
      title: "Submit Product Rating Failed",
      message: "Error guardando reseña",
      error,
    });
    return { ok: false, message: "No se pudo guardar la reseña. Inténtalo de nuevo." };
  }
}
