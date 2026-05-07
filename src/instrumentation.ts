export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.CONTENT_CRON_ENABLED !== "true") return;

  // webpackIgnore: true tells webpack not to bundle this — node-cron uses node:crypto (ESM)
  const cron = await import(/* webpackIgnore: true */ "node-cron");
  const schedule = process.env.CONTENT_CRON_SCHEDULE ?? "0 14 * * *";
  const secret = process.env.CONTENT_CRON_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  cron.default.schedule(schedule, async () => {
    try {
      await fetch(`${appUrl}/api/content/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}` },
      });
    } catch (err) {
      console.error("[CRON] Content generation trigger failed:", err);
    }
  });
}
