"use server";

import { auth } from "@/auth-config";
import { revalidatePath } from "next/cache";
import { createDraftAsync } from "@/services/content-pipeline";
import type { GenerationActionResult } from "@/interfaces/content.interface";

export async function triggerGeneration(productId?: string): Promise<GenerationActionResult> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { ok: false, message: "No autorizado" };
  }

  try {
    const contentPostId = await createDraftAsync("manual", session.user.id, productId);
    revalidatePath("/admin/content");
    return { ok: true, contentPostId };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error generando contenido",
    };
  }
}
