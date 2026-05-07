import { NextRequest, NextResponse } from "next/server";
import { runContentPipeline } from "@/services/content-pipeline";

export async function POST(req: NextRequest) {
  const secret = process.env.CONTENT_CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Fire-and-forget: responde inmediatamente para no bloquear el cron
  runContentPipeline("cron").catch(() => {});

  return NextResponse.json({ triggered: true });
}
