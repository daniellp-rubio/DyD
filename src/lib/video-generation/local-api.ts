const VIDEO_API_URL = process.env.VIDEO_API_URL ?? "http://localhost:8001";

export interface VideoJobStatus {
  status: "pending" | "generating" | "done" | "failed";
  video_url?: string;
  error?: string;
}

export async function startVideoGeneration(imageUrl: string, prompt: string): Promise<string> {
  const res = await fetch(`${VIDEO_API_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Video API (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { job_id: string };
  return data.job_id;
}

export async function checkVideoJob(jobId: string): Promise<VideoJobStatus> {
  const res = await fetch(`${VIDEO_API_URL}/job/${jobId}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Video API: job ${jobId} no encontrado`);
  return res.json() as Promise<VideoJobStatus>;
}

export async function isVideoApiReady(): Promise<boolean> {
  try {
    const res = await fetch(`${VIDEO_API_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok: boolean; model_ready: boolean };
    return data.ok && data.model_ready;
  } catch {
    return false;
  }
}
