import type { NextRequest } from "next/server";

// Verifica el bearer de los crons. Vercel Cron envía `Authorization: Bearer <CRON_SECRET>`,
// así que basta con poner CRON_SECRET = CONTENT_CRON_SECRET en Vercel.
export function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CONTENT_CRON_SECRET;
  const auth = req.headers.get("authorization");
  return !!secret && auth === `Bearer ${secret}`;
}
