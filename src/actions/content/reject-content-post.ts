"use server";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ApprovalActionResult } from "@/interfaces/content.interface";

export async function rejectContentPost(
  contentPostId: string,
  adminNotes: string
): Promise<ApprovalActionResult> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { ok: false, message: "No autorizado" };
  }

  if (!adminNotes.trim()) {
    return { ok: false, message: "Debes indicar el motivo del rechazo" };
  }

  const post = await prisma.contentPost.findUnique({ where: { id: contentPostId } });
  if (!post) return { ok: false, message: "Post no encontrado" };

  await prisma.contentPost.update({
    where: { id: contentPostId },
    data: { status: "rejected", adminNotes },
  });

  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${contentPostId}`);
  return { ok: true };
}
