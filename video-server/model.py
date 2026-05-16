import os
import tempfile
import threading
from io import BytesIO

import requests
import torch
from diffusers import CogVideoXImageToVideoPipeline
from diffusers.utils import export_to_video
from PIL import Image

MODEL_ID = os.environ.get("COGVIDEO_MODEL", "THUDM/CogVideoX-5b-I2V")
CPU_OFFLOAD = os.environ.get("COGVIDEO_CPU_OFFLOAD", "false").lower() == "true"
NUM_INFERENCE_STEPS = int(os.environ.get("COGVIDEO_STEPS", "20"))
NUM_FRAMES = int(os.environ.get("COGVIDEO_FRAMES", "25"))
VIDEO_FPS = int(os.environ.get("COGVIDEO_FPS", "8"))

# CogVideoX-5b-I2V fixed resolution — cannot be changed
VIDEO_WIDTH = 720
VIDEO_HEIGHT = 480


class VideoModel:
    def __init__(self) -> None:
        self.pipe: CogVideoXImageToVideoPipeline | None = None
        self._lock = threading.Lock()
        self.ready = False
        self.load_error: str | None = None

    def load(self) -> None:
        try:
            print(f"[video-server] Cargando {MODEL_ID} en GPU…")
            pipe = CogVideoXImageToVideoPipeline.from_pretrained(
                MODEL_ID,
                torch_dtype=torch.bfloat16,
            )
            pipe = pipe.to("cuda")
            if CPU_OFFLOAD:
                pipe.enable_model_cpu_offload()
                print("[video-server] CPU offload habilitado")

            pipe.vae.enable_tiling()
            pipe.vae.enable_slicing()

            self.pipe = pipe
            self.ready = True
            print("[video-server] Modelo listo ✓")
        except Exception as exc:
            self.load_error = str(exc)
            print(f"[video-server] Error cargando modelo: {exc}")

    def generate(self, image_url: str, prompt: str) -> str:
        if not self.ready or self.pipe is None:
            raise RuntimeError("Modelo no listo. Espera a que cargue o revisa los logs.")

        with self._lock:
            # Download and prepare input image
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content)).convert("RGB")
            image = image.resize((VIDEO_WIDTH, VIDEO_HEIGHT), Image.LANCZOS)

            print(f"[video-server] Generando video: {prompt[:60]}…")
            video_frames = self.pipe(
                prompt=prompt,
                image=image,
                num_videos_per_prompt=1,
                num_inference_steps=NUM_INFERENCE_STEPS,
                num_frames=NUM_FRAMES,
                guidance_scale=6,
                generator=torch.Generator(device="cuda").manual_seed(42),
            ).frames[0]

            tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
            tmp.close()
            export_to_video(video_frames, tmp.name, fps=VIDEO_FPS)
            print(f"[video-server] Video generado → {tmp.name}")
            return tmp.name
