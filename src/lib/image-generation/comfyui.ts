import crypto from "crypto";

const COMFYUI_URL = process.env.COMFYUI_URL ?? "http://127.0.0.1:8000";

// Nombres de archivo — deben coincidir exactamente con lo que descargaste
const UNET_MODEL = process.env.COMFYUI_UNET ?? "flux1-dev-fp8.safetensors";
const VAE_MODEL = process.env.COMFYUI_VAE ?? "ae.safetensors";
const CLIP_T5 = process.env.COMFYUI_CLIP_T5 ?? "t5xxl_fp8_e4m3fn.safetensors";
const CLIP_L = process.env.COMFYUI_CLIP_L ?? "clip_l.safetensors";

function buildWorkflow(prompt: string, seed: number): Record<string, unknown> {
  return {
    "1": {
      inputs: { unet_name: UNET_MODEL, weight_dtype: "fp8_e4m3fn" },
      class_type: "UNETLoader",
    },
    "2": {
      inputs: { clip_name1: CLIP_T5, clip_name2: CLIP_L, type: "flux" },
      class_type: "DualCLIPLoader",
    },
    "3": {
      inputs: { vae_name: VAE_MODEL },
      class_type: "VAELoader",
    },
    "4": {
      inputs: { text: prompt, clip: ["2", 0] },
      class_type: "CLIPTextEncode",
    },
    "5": {
      inputs: { width: 1024, height: 1024, batch_size: 1 },
      class_type: "EmptySD3LatentImage",
    },
    "6": {
      inputs: {
        seed: seed,
        cfg: 1.0,
        sampler_name: "euler",
        scheduler: "simple",
        steps: 20,
        denoise: 1.0,
        model: ["1", 0],
        positive: ["4", 0],
        negative: ["7", 0],
        latent_image: ["5", 0],
      },
      class_type: "KSampler",
    },
    "7": {
      inputs: { text: "", clip: ["2", 0] },
      class_type: "CLIPTextEncode",
    },
    "8": {
      inputs: { samples: ["6", 0], vae: ["3", 0] },
      class_type: "VAEDecode",
    },
    "9": {
      inputs: { filename_prefix: "dyd_content", images: ["8", 0] },
      class_type: "SaveImage",
    },
  };
}

interface ComfyOutput {
  images?: Array<{ filename: string; subfolder: string; type: string }>;
}

interface ComfyHistory {
  [id: string]: {
    status?: { completed?: boolean };
    outputs?: Record<string, ComfyOutput>;
  };
}

async function pollUntilDone(promptId: string, timeoutMs = 180_000): Promise<ComfyOutput> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch(`${COMFYUI_URL}/history/${promptId}`);
    if (!res.ok) continue;

    const history = (await res.json()) as ComfyHistory;
    const entry = history[promptId];

    if (entry?.status?.completed && entry.outputs?.["9"]?.images?.length) {
      return entry.outputs["9"];
    }
  }

  throw new Error(`ComfyUI: timeout (${timeoutMs / 1000}s) esperando imagen`);
}

export async function generateMarketingImageLocal(prompt: string): Promise<string> {
  const clientId = crypto.randomUUID();
  const seed = Math.floor(Math.random() * 2 ** 32);

  const queueRes = await fetch(`${COMFYUI_URL}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: buildWorkflow(prompt, seed), client_id: clientId }),
  });

  if (!queueRes.ok) {
    throw new Error(`ComfyUI /prompt falló (${queueRes.status}): ${await queueRes.text()}`);
  }

  const { prompt_id } = (await queueRes.json()) as { prompt_id: string };
  const output = await pollUntilDone(prompt_id);
  const image = output.images![0];

  const imgRes = await fetch(
    `${COMFYUI_URL}/view?filename=${encodeURIComponent(image.filename)}&subfolder=${encodeURIComponent(image.subfolder)}&type=output`,
  );

  if (!imgRes.ok) throw new Error("ComfyUI: no se pudo descargar la imagen generada");

  const buffer = await imgRes.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
}
