"use server";

import { auth } from "@/auth-config";
import { selectProductForToday } from "@/agents/orchestrator";
import { runAdCopywriter } from "@/agents/ad-copywriter";
import type { AdCopyActionResult } from "@/interfaces/content.interface";

interface AdCopyOptions {
  targetAudience?: string;
  goal?: string;
}

export async function generateAdCopy(
  productId: string,
  opts?: AdCopyOptions
): Promise<AdCopyActionResult> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { ok: false, message: "No autorizado" };
  }
  if (!productId) {
    return { ok: false, message: "productId requerido" };
  }

  try {
    const product = await selectProductForToday(productId);
    const data = await runAdCopywriter(
      product,
      opts?.targetAudience?.trim() || "jóvenes 18-30 en Medellín interesados en gadgets Apple",
      opts?.goal?.trim() || "tráfico al WhatsApp"
    );
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error generando copy de anuncios",
    };
  }
}
