import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { Logger } from "@/lib/logger";

const schema = z.object({
  reason: z.string().trim().min(1).max(120),
  path: z.string().trim().max(200).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Respuesta inválida" }, { status: 400 });
    }

    const { reason, path } = parsed.data;

    Logger.info({
      title: "Exit Survey",
      message: reason,
      metadata: { path: path ?? "unknown" },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
