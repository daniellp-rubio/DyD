import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "dtttwxbgr";

function getCredentials(): { apiKey: string; apiSecret: string } {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    const match = url.match(/cloudinary:\/\/(\d+):([^@]+)@/);
    if (match) return { apiKey: match[1], apiSecret: match[2] };
  }
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (apiKey && apiSecret) return { apiKey, apiSecret };
  throw new Error("Cloudinary: faltan credenciales (CLOUDINARY_URL o CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET)");
}

export async function uploadToCloudinary(imageSource: string, folder: string): Promise<string> {
  const { apiKey, apiSecret } = getCredentials();
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

  const formData = new FormData();
  formData.append("file", imageSource);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload falló (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
