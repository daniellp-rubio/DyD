import { Logger } from '@/lib/logger';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) return true;

  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    Logger.error({
      title: 'Turnstile Verify Failed',
      message: 'Error contacting Cloudflare siteverify',
      error,
    });
    return false;
  }
}
