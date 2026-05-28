"use server";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import type { ProductReviewsData, ProductReviewSummary } from "@/interfaces";

const emptySummary = (): ProductReviewSummary => ({
  average: 0,
  total: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
});

export async function getProductReviews(productId: string): Promise<ProductReviewsData> {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const [approved, myRow] = await Promise.all([
      prisma.productRatings.findMany({
        where: { productId, status: "approved" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          // Uncomment after running `npx dotenv-cli -e .env.cloud -- npx prisma db push`
          // photoUrl: true,
          verifiedBuyer: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      userId
        ? prisma.productRatings.findUnique({
            where: { userId_productId: { userId, productId } },
            select: { rating: true, comment: true, status: true, verifiedBuyer: true },
          })
        : Promise.resolve(null),
    ]);

    const distribution: ProductReviewSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const r of approved) {
      const star = Math.min(Math.max(r.rating, 1), 5) as 1 | 2 | 3 | 4 | 5;
      distribution[star] += 1;
      sum += r.rating;
    }

    const total = approved.length;
    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    return {
      summary: { average, total, distribution },
      reviews: approved.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        photoUrl: (r as any).photoUrl ?? null,
        authorName: r.user?.name ?? "Usuario",
        verifiedBuyer: r.verifiedBuyer,
        createdAt: r.createdAt,
      })),
      myReview: myRow
        ? {
            rating: myRow.rating,
            comment: myRow.comment,
            status: myRow.status,
            verifiedBuyer: myRow.verifiedBuyer,
          }
        : null,
      isAuthenticated: Boolean(userId),
    };
  } catch (error) {
    Logger.error({
      title: "Get Product Reviews Failed",
      message: "Error obteniendo reseñas",
      error,
    });
    return { summary: emptySummary(), reviews: [], myReview: null, isAuthenticated: false };
  }
}
