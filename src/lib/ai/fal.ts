// fal.ai image-to-video via the queue REST API.
// NOTE: video generation takes minutes; Vercel functions cap at 10s — so this
// submits to the queue (fire) and is polled separately (poll), never run sync.
// Verify model id / field names against https://fal.ai/models before going live.
// Reads process.env directly (not @/lib/env) to avoid build-time env validation.

const QUEUE_BASE = "https://queue.fal.run";
const DEFAULT_MODEL = "fal-ai/wan/v2.2-a14b/image-to-video/turbo";

function falKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY no configurada (proveedor de video 'fal')");
  return key;
}

export interface FalSubmission {
  requestId: string;
  statusUrl: string;
  responseUrl: string;
}

export type FalQueueStatus = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | string;

export interface FalVideoResult {
  status: FalQueueStatus;
  videoUrl?: string;
}

// Submit an image-to-video job. Returns the queue handles to poll later.
export async function submitImageToVideo(
  imageUrl: string,
  prompt: string,
  resolution: "480p" | "720p" = "480p"
): Promise<FalSubmission> {
  const model = process.env.FAL_VIDEO_MODEL || DEFAULT_MODEL;
  const res = await fetch(`${QUEUE_BASE}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image_url: imageUrl, prompt, resolution }),
  });

  if (!res.ok) {
    throw new Error(`fal submit falló (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as {
    request_id: string;
    status_url: string;
    response_url: string;
  };

  return {
    requestId: data.request_id,
    statusUrl: data.status_url,
    responseUrl: data.response_url,
  };
}

export async function getQueueStatus(statusUrl: string): Promise<FalQueueStatus> {
  const res = await fetch(statusUrl, { headers: { Authorization: `Key ${falKey()}` } });
  if (!res.ok) throw new Error(`fal status falló (${res.status})`);
  const data = (await res.json()) as { status: FalQueueStatus };
  return data.status;
}

export async function getQueueResult(responseUrl: string): Promise<FalVideoResult> {
  const res = await fetch(responseUrl, { headers: { Authorization: `Key ${falKey()}` } });
  if (!res.ok) throw new Error(`fal result falló (${res.status})`);
  const data = (await res.json()) as { video?: { url?: string }; status?: FalQueueStatus };
  return { status: data.status ?? "COMPLETED", videoUrl: data.video?.url };
}
