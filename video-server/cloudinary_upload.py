import hashlib
import os
import time

import requests


def upload_video_to_cloudinary(video_path: str, folder: str = "dyd-content-videos") -> str:
    cloud_name = os.environ["CLOUDINARY_CLOUD_NAME"]
    api_key = os.environ["CLOUDINARY_API_KEY"]
    api_secret = os.environ["CLOUDINARY_API_SECRET"]

    timestamp = str(int(time.time()))
    params_to_sign = f"folder={folder}&timestamp={timestamp}"
    signature = hashlib.sha1((params_to_sign + api_secret).encode()).hexdigest()

    with open(video_path, "rb") as f:
        res = requests.post(
            f"https://api.cloudinary.com/v1_1/{cloud_name}/video/upload",
            data={
                "api_key": api_key,
                "timestamp": timestamp,
                "signature": signature,
                "folder": folder,
            },
            files={"file": ("video.mp4", f, "video/mp4")},
            timeout=180,
        )

    res.raise_for_status()
    return res.json()["secure_url"]
