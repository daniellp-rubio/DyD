"use server";

import { auth } from "@/auth-config";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { runVideoScripterAgent } from "@/agents/video-scripter-agent";
import { startVideoGeneration, isVideoApiReady } from "@/lib/video-generation/local-api";
import type { ApprovalActionResult, VideoStatus } from "@/interfaces/content.interface";

type PostWithVideo = {
  id: string;
  status: string;
  angle: string | null;
  baseImageUrl: string | null;
  videoStatus: VideoStatus | null;
  product: { title: string; category: { name: string } };
  platforms: { platform: string; imageUrl: string }[];
};

export async function generateVideo(contentPostId: string): Promise<ApprovalActionResult> {
  const session = await auth();
  if (session?.user?.role !== "admin") return { ok: false, message: "No autorizado" };

  const post = (await prisma.contentPost.findUnique({
    where: { id: contentPostId },
    include: {
      product: { include: { category: true } },
      platforms: { where: { platform: "instagram" } },
    },
  })) as PostWithVideo | null;

  if (!post) return { ok: false, message: "Post no encontrado" };
  if (post.status !== "approved") return { ok: false, message: "Solo posts aprobados pueden generar video" };
  if (post.videoStatus === "generating") return { ok: false, message: "Ya hay un video generándose" };

  const imageUrl = post.platforms[0]?.imageUrl ?? post.baseImageUrl ?? "";
  if (!imageUrl) return { ok: false, message: "No hay imagen base para el video" };

  const apiReady = await isVideoApiReady();
  if (!apiReady) {
    return {
      ok: false,
      message: "El servidor de video no está disponible. Inícialo con: cd video-server && uv run python main.py",
    };
  }

  const videoScript = await runVideoScripterAgent(
    post.product.title,
    post.product.category.name,
    post.angle as Parameters<typeof runVideoScripterAgent>[2]
  );

  const jobId = await startVideoGeneration(imageUrl, videoScript.motionPrompt);

  await prisma.contentPost.update({
    where: { id: contentPostId },
    data: { videoStatus: "generating", videoJobId: jobId, videoUrl: null },
  });

  revalidatePath(`/admin/content/${contentPostId}`);
  return { ok: true };
}
