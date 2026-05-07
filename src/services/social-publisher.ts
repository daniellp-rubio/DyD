import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import type { SocialPlatform } from "@prisma/client";

interface PlatformPost {
  platform: SocialPlatform;
  caption: string;
  hashtags: string[];
  imageUrl: string;
  hookLine: string | null;
}

export interface PublishResult {
  platform: SocialPlatform;
  success: boolean;
  mediaId?: string;
  error?: string;
}

async function publishToInstagram(post: PlatformPost): Promise<PublishResult> {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    return {
      platform: "instagram",
      success: false,
      error: "Credenciales no configuradas (INSTAGRAM_BUSINESS_ACCOUNT_ID, INSTAGRAM_ACCESS_TOKEN)",
    };
  }

  const caption = `${post.caption}\n\n${post.hashtags.map((h) => `#${h}`).join(" ")}`;

  // Step 1: Create media container
  const createRes = await fetch(`https://graph.instagram.com/v22.0/${accountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: post.imageUrl, caption, access_token: accessToken }),
  });

  const createData = (await createRes.json()) as {
    id?: string;
    error?: { message: string; type?: string; code?: number };
  };

  if (!createRes.ok || !createData.id) {
    const msg = createData.error?.message ?? JSON.stringify(createData);
    return { platform: "instagram", success: false, error: `Container creation failed: ${msg}` };
  }

  // Step 2: Publish container
  const publishRes = await fetch(`https://graph.instagram.com/v22.0/${accountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: createData.id, access_token: accessToken }),
  });

  const publishData = (await publishRes.json()) as {
    id?: string;
    error?: { message: string };
  };

  if (!publishRes.ok || !publishData.id) {
    const msg = publishData.error?.message ?? JSON.stringify(publishData);
    return { platform: "instagram", success: false, error: `Publish failed: ${msg}` };
  }

  return { platform: "instagram", success: true, mediaId: publishData.id };
}

async function publishToTikTok(post: PlatformPost): Promise<PublishResult> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      platform: "tiktok",
      success: false,
      error: "Credenciales no configuradas (TIKTOK_ACCESS_TOKEN)",
    };
  }

  // TikTok title: hook + caption + hashtags (max 2200 chars)
  const parts = [
    post.hookLine,
    post.caption,
    post.hashtags.map((h) => `#${h}`).join(" "),
  ]
    .filter(Boolean)
    .join("\n\n");
  const title = parts.slice(0, 2200);

  const res = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title,
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_images: [post.imageUrl],
        photo_cover_index: 0,
      },
      post_mode: "DIRECT_POST",
      media_type: "PHOTO",
    }),
  });

  const data = (await res.json()) as {
    data?: { publish_id?: string };
    error?: { code: string; message: string };
  };

  if (!res.ok || data.error?.code !== "ok") {
    const msg = data.error?.message ?? JSON.stringify(data);
    return { platform: "tiktok", success: false, error: `TikTok publish failed: ${msg}` };
  }

  return { platform: "tiktok", success: true, mediaId: data.data?.publish_id };
}

export async function publishContentPost(contentPostId: string): Promise<{
  allSucceeded: boolean;
  results: PublishResult[];
  errorLog?: string;
}> {
  const post = await prisma.contentPost.findUnique({
    where: { id: contentPostId },
    include: { platforms: true },
  });

  if (!post) throw new Error(`ContentPost ${contentPostId} no encontrado`);
  if (post.status !== "approved") throw new Error(`Post ${contentPostId} no está en estado approved`);

  const results = await Promise.all(
    post.platforms.map((p) =>
      p.platform === "instagram" ? publishToInstagram(p) : publishToTikTok(p)
    )
  );

  const failures = results.filter((r) => !r.success);
  const allSucceeded = failures.length === 0;
  const errorLog = failures.length > 0
    ? failures.map((f) => `[${f.platform}] ${f.error}`).join("\n")
    : undefined;

  Logger.info({
    title: allSucceeded ? "Content Published" : "Content Publish Partial",
    message: allSucceeded
      ? `Post ${contentPostId} publicado en todas las plataformas`
      : `Post ${contentPostId} con errores:\n${errorLog}`,
    metadata: {
      contentPostId,
      results: results.map((r) => ({ platform: r.platform, success: r.success, mediaId: r.mediaId })),
    },
  });

  return { allSucceeded, results, errorLog };
}
