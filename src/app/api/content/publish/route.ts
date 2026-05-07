import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { publishContentPost } from "@/services/social-publisher";
import { Logger } from "@/lib/logger";

// POST /api/content/publish
// Publishes all approved posts (max 5 per call to avoid timeouts).
// Auth: Authorization: Bearer <CONTENT_CRON_SECRET>
export async function POST(req: NextRequest) {
  const secret = process.env.CONTENT_CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const approvedPosts = await prisma.contentPost.findMany({
    where: { status: "approved" },
    orderBy: { approvedAt: "asc" },
    take: 5,
    select: { id: true },
  });

  if (approvedPosts.length === 0) {
    return NextResponse.json({ published: 0, skipped: "No hay posts aprobados" });
  }

  const results: { id: string; status: "published" | "failed"; error?: string }[] = [];

  for (const { id } of approvedPosts) {
    try {
      const { allSucceeded, errorLog } = await publishContentPost(id);

      if (allSucceeded) {
        await prisma.contentPost.update({
          where: { id },
          data: { status: "published", publishedAt: new Date(), errorLog: null },
        });
        results.push({ id, status: "published" });
      } else {
        await prisma.contentPost.update({ where: { id }, data: { errorLog } });
        results.push({ id, status: "failed", error: errorLog });
      }
    } catch (err) {
      Logger.error({
        title: "Batch Publish Error",
        message: `Failed to publish post ${id}`,
        error: err as Error,
      });
      results.push({ id, status: "failed", error: String(err) });
    }
  }

  return NextResponse.json({
    published: results.filter((r) => r.status === "published").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  });
}
