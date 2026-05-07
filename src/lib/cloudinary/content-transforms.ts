const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "dtttwxbgr";
const LOGO_PUBLIC_ID = process.env.CLOUDINARY_LOGO_PUBLIC_ID ?? "Logo_Compacto_con_Fondo_Transparente_DYD_TECH_640x640_pvsf3w";

export function extractPublicId(cloudinaryUrl: string): string {
  const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  if (!match) throw new Error(`URL Cloudinary inválida: ${cloudinaryUrl}`);
  return match[1];
}

function logoOverlay(gravity: "south_east" | "north_east", width: number, y: number): string {
  return `l_${LOGO_PUBLIC_ID},w_${width},g_${gravity},x_20,y_${y},o_90`;
}

export function buildInstagramUrl(baseImageUrl: string): string {
  try {
    const publicId = extractPublicId(baseImageUrl);
    const crop = "c_fill,w_1080,h_1080,g_auto";
    const logo = logoOverlay("south_east", 180, 20);
    const bg = "b_rgb:1C1C1C";
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${crop}/${logo}/${bg}/${publicId}`;
  } catch {
    return baseImageUrl;
  }
}

export function buildTikTokUrl(baseImageUrl: string): string {
  try {
    const publicId = extractPublicId(baseImageUrl);
    const crop = "c_fill,w_1080,h_1920,g_auto";
    const logo = logoOverlay("north_east", 220, 60);
    const bg = "b_rgb:1C1C1C";
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${crop}/${logo}/${bg}/${publicId}`;
  } catch {
    return baseImageUrl;
  }
}
