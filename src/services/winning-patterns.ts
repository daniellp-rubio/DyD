import prisma from "@/lib/prisma";

// Loop de aprendizaje: patrones de videos ganadores que el scriptwriter puede
// consultar antes de generar el próximo guion (self-improving).

export interface WinningPatternInput {
  hookStyle: string;
  pacingAvg?: number;
  ctaPosition?: number;
  retention3s?: number;
  viralityScore?: number;
  sampleVideoUrl?: string;
}

export async function recordWinningPattern(input: WinningPatternInput) {
  return prisma.winningPattern.create({
    data: {
      hookStyle: input.hookStyle,
      pacingAvg: input.pacingAvg ?? null,
      ctaPosition: input.ctaPosition ?? null,
      retention3s: input.retention3s ?? null,
      viralityScore: input.viralityScore ?? null,
      sampleVideoUrl: input.sampleVideoUrl ?? null,
    },
  });
}

export async function getTopPatterns(limit = 5) {
  return prisma.winningPattern.findMany({
    orderBy: { viralityScore: "desc" },
    take: limit,
  });
}
