import { Logger } from "@/lib/logger";
import type { InstagramMediaItem } from "@/interfaces";

interface BeholdPost {
  id: string;
  caption?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
}

interface BeholdResponse {
  posts?: BeholdPost[];
  [key: string]: unknown;
}

const REVALIDATE_SECONDS = 3600;

/**
 * Lee las publicaciones de Instagram vía Behold.so (feed público, sin OAuth propio).
 * Degrada a [] si falta la env var o la API falla: la homepage nunca rompe.
 * Setup: https://behold.so → conectar Instagram → copiar Feed ID → BEHOLD_FEED_ID=...
 */
export async function getInstagramFeed(limit = 8): Promise<InstagramMediaItem[]> {
  const feedId = process.env.BEHOLD_FEED_ID;
  if (!feedId) return [];

  const url = `https://feeds.behold.so/${feedId}`;

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });

    if (!res.ok) {
      Logger.error({
        title: "Instagram Feed Fetch Failed",
        message: `Behold API HTTP ${res.status}`,
      });
      return [];
    }

    const body = (await res.json()) as BeholdResponse | BeholdPost[];
    const posts: BeholdPost[] = Array.isArray(body) ? body : (body.posts ?? []);

    return posts
      .slice(0, limit)
      .map((p): InstagramMediaItem | null => {
        const isVideo = p.mediaType === "VIDEO";
        const imageUrl = isVideo ? p.thumbnailUrl ?? p.mediaUrl : p.mediaUrl;
        if (!imageUrl || !p.permalink) return null;
        return {
          id: p.id,
          caption: p.caption ?? null,
          permalink: p.permalink,
          imageUrl,
          isVideo,
        };
      })
      .filter((p): p is InstagramMediaItem => p !== null);
  } catch (error) {
    Logger.error({
      title: "Instagram Feed Fetch Failed",
      message: "Error de red llamando a Behold API",
      error,
    });
    return [];
  }
}
