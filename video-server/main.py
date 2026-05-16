import os
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv()

from cloudinary_upload import upload_video_to_cloudinary  # noqa: E402
from model import VideoModel  # noqa: E402
from storage import job_store  # noqa: E402

video_model = VideoModel()
executor = ThreadPoolExecutor(max_workers=1)  # one video at a time (GPU constraint)


@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=video_model.load, daemon=True).start()
    yield


app = FastAPI(title="dyd video-server", lifespan=lifespan)


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "model_ready": video_model.ready,
        "load_error": video_model.load_error,
    }


class GenerateRequest(BaseModel):
    image_url: str
    prompt: str


@app.post("/generate")
def generate(req: GenerateRequest) -> dict:
    if not video_model.ready:
        raise HTTPException(
            status_code=503,
            detail="Modelo no listo aún. Consulta /health para ver el progreso.",
        )

    job_id = str(uuid.uuid4())
    job_store[job_id] = {"status": "pending", "video_url": None, "error": None}
    executor.submit(_run_job, job_id, req.image_url, req.prompt)
    return {"job_id": job_id}


@app.get("/job/{job_id}")
def get_job(job_id: str) -> dict:
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return job_store[job_id]


def _run_job(job_id: str, image_url: str, prompt: str) -> None:
    job_store[job_id]["status"] = "generating"
    video_path: str | None = None
    try:
        video_path = video_model.generate(image_url, prompt)
        cloudinary_url = upload_video_to_cloudinary(video_path)
        job_store[job_id]["status"] = "done"
        job_store[job_id]["video_url"] = cloudinary_url
        print(f"[video-server] Job {job_id} completado → {cloudinary_url}")
    except Exception as exc:
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(exc)
        print(f"[video-server] Job {job_id} falló: {exc}")
    finally:
        if video_path:
            try:
                os.unlink(video_path)
            except OSError:
                pass


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
