import prisma from "@/lib/prisma";
import { Prisma, type SocialPlatform } from "@prisma/client";
import { analyzeVideo } from "@/lib/ai/memories";

// Analiza un video publicado (Memories.ai) y guarda el breakdown + veredicto.
// Insight Stormy.ai: >75% retención a 3s = winner; <50% = needs_iteration.

function verdictFor(hookRetention3s: number | null): string {
  if (hookRetention3s == null) return "neutral";
  if (hookRetention3s >= 75) return "winner";
  if (hookRetention3s < 50) return "needs_iteration";
  return "neutral";
}

export async function analyzeAndStoreVideo(opts: {
  videoUrl: string;
  contentPostId?: string;
  platform?: SocialPlatform;
}) {
  const a = await analyzeVideo(opts.videoUrl);
  const verdict = verdictFor(a.hookRetention3s);

  return prisma.videoAnalysis.create({
    data: {
      contentPostId: opts.contentPostId ?? null,
      platform: opts.platform ?? null,
      videoUrl: opts.videoUrl,
      hookRetention3s: a.hookRetention3s,
      viralityScore: a.viralityScore,
      pacingScore: a.pacingScore,
      ctaScore: a.ctaScore,
      retentionCurve:
        a.retentionCurve == null
          ? Prisma.JsonNull
          : (a.retentionCurve as unknown as Prisma.InputJsonValue),
      rawAnalysis:
        a.raw == null ? Prisma.JsonNull : (a.raw as unknown as Prisma.InputJsonValue),
      verdict,
    },
  });
}
