"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import type { ModerateReviewResult } from "@/interfaces";

export async function moderateReview(
  reviewId: number,
  decision: "approved" | "rejected"
): Promise<ModerateReviewResult> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { ok: false, message: "No autorizado" };
  }

  try {
    const review = await prisma.productRatings.findUnique({
      where: { id: reviewId },
      select: { id: true, product: { select: { slug: true } } },
    });
    if (!review) return { ok: false, message: "Reseña no encontrada" };

    await prisma.productRatings.update({
      where: { id: reviewId },
      data: { status: decision },
    });

    revalidatePath("/admin/reviews");
    revalidatePath(`/product/${review.product.slug}`);
    return { ok: true };
  } catch (error) {
    Logger.error({
      title: "Moderate Review Failed",
      message: "Error moderando reseña",
      error,
    });
    return { ok: false, message: "No se pudo actualizar la reseña." };
  }
}
