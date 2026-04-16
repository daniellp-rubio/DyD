import { Logger } from '@/lib/logger';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';

  if (!apiKey) {
    Logger.warn({
      title: 'Email Skipped',
      message: 'RESEND_API_KEY missing — email not sent.',
      metadata: { to: to.replace(/(.{2}).+(@.+)/, '$1***$2'), subject },
    });
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });

    if (!res.ok) {
      const body = await res.text();
      Logger.error({
        title: 'Email Send Failed',
        message: 'Resend API returned non-2xx',
        metadata: { status: res.status, body },
      });
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    Logger.error({
      title: 'Email Send Crash',
      message: 'Unexpected exception sending email',
      error,
    });
    return { ok: false };
  }
}
