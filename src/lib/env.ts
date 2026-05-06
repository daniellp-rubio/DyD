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
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
