import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isCronAuthorized } from "@/lib/cron-auth";
import { analyzeAndStoreVideo } from "@/services/video-retention";

async function handle() {
  if (!process.env.MEMORIES_AI_API_KEY) {
    return NextResponse.json({ skipped: "MEMORIES_AI_API_KEY no configurada" });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const posts = await prisma.contentPost.findMany({
    where: { publishedAt: { gte: since }, videoUrl: { not: null } },
    take: 10,
    select: { id: true, videoUrl: true },
  });

  let analyzed = 0;
  const errors: string[] = [];
  for (const p of posts) {
    if (!p.videoUrl) continue;
    try {
      await analyzeAndStoreVideo({ videoUrl: p.videoUrl, contentPostId: p.id });
      analyzed++;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  return NextResponse.json({ analyzed, errors });
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return handle();
}

export async function POST(req: NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return handle();
}
