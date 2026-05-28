import type { ReviewStatus } from "@prisma/client";

export type { ReviewStatus };

export interface ProductReview {
  id: number;
  rating: number;
  comment: string | null;
  photoUrl: string | null;
  authorName: string;
  verifiedBuyer: boolean;
  createdAt: Date;
}

export interface ProductReviewSummary {
  average: number; // 0..5 con 1 decimal
  total: number; // cantidad de reseñas aprobadas
  distribution: Record<1 | 2 | 3 | 4 | 5, number>; // conteo por estrella
}

export interface MyProductReview {
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  verifiedBuyer: boolean;
}

export interface ProductReviewsData {
  summary: ProductReviewSummary;
  reviews: ProductReview[];
  myReview: MyProductReview | null;
  isAuthenticated: boolean;
}

export interface PendingReview {
  id: number;
  rating: number;
  comment: string | null;
  authorName: string;
  authorEmail: string;
  productTitle: string;
  productSlug: string;
  createdAt: Date;
}

export type SubmitReviewResult =
  | { ok: true; status: ReviewStatus; message: string }
  | { ok: false; message: string };

export type ModerateReviewResult = { ok: true } | { ok: false; message: string };
