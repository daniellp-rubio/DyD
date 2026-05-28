"use server";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import type { PendingReview } from "@/interfaces";

export async function getPendingReviews(): Promise<PendingReview[]> {
  const session = await auth();
  if (session?.user?.role !== "admin") return [];

  try {
    const rows = await prisma.productRatings.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        product: { select: { title: true, slug: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      authorName: r.user?.name ?? "Usuario",
      authorEmail: r.user?.email ?? "",
      productTitle: r.product.title,
      productSlug: r.product.slug,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    Logger.error({
      title: "Get Pending Reviews Failed",
      message: "Error obteniendo reseñas pendientes",
      error,
    });
    return [];
  }
}
