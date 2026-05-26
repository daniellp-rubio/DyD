// Memories.ai — análisis de retención/hook de un video real (visual + audio).
// La forma exacta de la API debe verificarse contra los docs de memories.ai;
// se parsea defensivamente para no romper si cambian nombres de campos.
// Lee process.env directo (no @/lib/env) para no disparar validación en build.

const DEFAULT_BASE = "https://api-tools.memories.ai";

function memoriesKey(): string {
  const key = process.env.MEMORIES_AI_API_KEY;
  if (!key) throw new Error("MEMORIES_AI_API_KEY no configurada");
  return key;
}

export interface VideoRetentionAnalysis {
  hookRetention3s: number | null; // % retención primeros 3s
  viralityScore: number | null;
  pacingScore: number | null;
  ctaScore: number | null;
  retentionCurve: unknown;
  raw: unknown;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function analyzeVideo(videoUrl: string): Promise<VideoRetentionAnalysis> {
  const base = process.env.MEMORIES_AI_BASE_URL || DEFAULT_BASE;
  const res = await fetch(`${base}/v1/videos/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${memoriesKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ video_url: videoUrl }),
  });

  if (!res.ok) {
    throw new Error(`memories.ai analyze falló (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as Record<string, unknown>;

  return {
    hookRetention3s: num(data.hook_retention_3s ?? data.retention_3s),
    viralityScore: num(data.virality_score),
    pacingScore: num(data.pacing_score),
    ctaScore: num(data.cta_score),
    retentionCurve: data.retention_curve ?? null,
    raw: data,
  };
}
