"use server";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ApprovalActionResult } from "@/interfaces/content.interface";

export async function approveContentPost(
  contentPostId: string,
  adminNotes?: string
): Promise<ApprovalActionResult> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { ok: false, message: "No autorizado" };
  }

  const post = await prisma.contentPost.findUnique({ where: { id: contentPostId } });
  if (!post) return { ok: false, message: "Post no encontrado" };
  if (post.status !== "ready") return { ok: false, message: "Solo se pueden aprobar posts en estado 'ready'" };

  await prisma.contentPost.update({
    where: { id: contentPostId },
    data: { status: "approved", approvedAt: new Date(), adminNotes: adminNotes ?? null },
  });

  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${contentPostId}`);
  return { ok: true };
}
