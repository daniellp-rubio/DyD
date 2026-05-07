"use server";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { publishContentPost } from "@/services/social-publisher";
import type { ApprovalActionResult } from "@/interfaces/content.interface";

export async function publishPost(contentPostId: string): Promise<ApprovalActionResult> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { ok: false, message: "No autorizado" };
  }

  const post = await prisma.contentPost.findUnique({ where: { id: contentPostId } });
  if (!post) return { ok: false, message: "Post no encontrado" };
  if (post.status !== "approved") {
    return { ok: false, message: "Solo se pueden publicar posts aprobados" };
  }

  try {
    const { allSucceeded, errorLog } = await publishContentPost(contentPostId);

    if (allSucceeded) {
      await prisma.contentPost.update({
        where: { id: contentPostId },
        data: { status: "published", publishedAt: new Date(), errorLog: null },
      });
      revalidatePath("/admin/content");
      revalidatePath(`/admin/content/${contentPostId}`);
      return { ok: true };
    }

    // Partial or total failure: keep approved, store error
    await prisma.contentPost.update({
      where: { id: contentPostId },
      data: { errorLog },
    });
    revalidatePath("/admin/content");
    revalidatePath(`/admin/content/${contentPostId}`);
    return { ok: false, message: errorLog ?? "Error desconocido publicando" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
