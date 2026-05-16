import type { PostStatus, ContentAngle, SocialPlatform } from "@prisma/client";

export type { PostStatus, ContentAngle, SocialPlatform };

// Mirrors the Prisma VideoStatus enum — will be replaced by the generated type after migration.
export type VideoStatus = "pending" | "generating" | "ready" | "failed";

export interface ProductContext {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceInOffer: number;
  inStock: number;
  description: string;
  tags: string[];
  contentId: string;
  categoryName: string;
  primaryImageUrl: string;
  allImageUrls: string[];
}

export interface StrategyDecision {
  angle: ContentAngle;
  rationale: string;
  keySellingPoints: string[];
  targetEmotion: string;
}

export interface BaseCopyResult {
  headline: string;
  body: string;
  cta: string;
}

export interface InstagramContent {
  caption: string;
  hashtags: string[];
  suggestedPostTime: string;
}

export interface TikTokContent {
  hookLine: string;
  caption: string;
  hashtags: string[];
  suggestedPostTime: string;
}

export interface DesignedImages {
  instagramUrl: string;
  tiktokUrl: string;
}

export interface PipelineResult {
  contentPostId: string;
  product: ProductContext;
  strategy: StrategyDecision;
  baseCopy: BaseCopyResult;
  instagram: InstagramContent;
  tiktok: TikTokContent;
  images: DesignedImages;
}

export interface ContentPostSummary {
  id: string;
  status: PostStatus;
  angle: ContentAngle | null;
  productTitle: string;
  productSlug: string;
  generatedAt: Date | null;
  createdAt: Date;
  triggerSource: string;
}

export interface ContentPostDetail {
  id: string;
  status: PostStatus;
  angle: ContentAngle | null;
  baseCopy: string | null;
  baseImageUrl: string | null;
  adminNotes: string | null;
  errorLog: string | null;
  generatedAt: Date | null;
  approvedAt: Date | null;
  triggerSource: string;
  videoUrl: string | null;
  videoStatus: VideoStatus | null;
  product: ProductContext;
  platforms: {
    id: string;
    platform: SocialPlatform;
    caption: string;
    hashtags: string[];
    imageUrl: string;
    hookLine: string | null;
    suggestedPostTime: string | null;
  }[];
}

export type GenerationActionResult =
  | { ok: true; contentPostId: string }
  | { ok: false; message: string };

export type ApprovalActionResult =
  | { ok: true }
  | { ok: false; message: string };
