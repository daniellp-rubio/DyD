import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  POSTGRES_PRISMA_URL: z.string().url(),
  POSTGRES_URL_NON_POOLING: z.string().url(),

  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars"),
  AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  REQUIRE_VERIFIED_EMAIL: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),

  MERCADOPAGO_ACCESS_TOKEN: z.string().min(1),
  MERCADOPAGO_NOTIFICATION_URL: z.string().url(),
  MERCADOPAGO_WEBHOOK_SECRET: isProd ? z.string().min(8) : z.string().optional(),

  TURNSTILE_SECRET_KEY: isProd ? z.string().min(1) : z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),

  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),

  CLOUDINARY_URL: z.string().optional(),

  META_PIXEL_ID: z.string().optional(),
  META_CAPI_TOKEN: z.string().optional(),
  META_TEST_EVENT_CODE: z.string().optional(),

  DISCORD_WEBHOOK_URL_INFO: z.string().url().optional(),
  DISCORD_WEBHOOK_URL_ERRORS: z.string().url().optional(),

  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  TOGETHER_API_KEY: z.string().min(1).optional(),
  IMAGE_PROVIDER: z.enum(["local", "together"]).default("together"),
  COMFYUI_URL: z.string().url().default("http://127.0.0.1:8188"),
  COMFYUI_UNET: z.string().optional(),
  COMFYUI_VAE: z.string().optional(),
  COMFYUI_CLIP_T5: z.string().optional(),
  COMFYUI_CLIP_L: z.string().optional(),
  CONTENT_CRON_SCHEDULE: z.string().default("0 14 * * *"),
  CONTENT_CRON_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  CONTENT_CRON_SECRET: z.string().min(16).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().default("dtttwxbgr"),
  CLOUDINARY_LOGO_PUBLIC_ID: z.string().default("Logo_Compacto_con_Fondo_Transparente_DYD_TECH_640x640_pvsf3w"),

  // Social publishing
  INSTAGRAM_BUSINESS_ACCOUNT_ID: z.string().optional(),
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  TIKTOK_ACCESS_TOKEN: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
