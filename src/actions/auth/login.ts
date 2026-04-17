'use server';

import { AuthError } from 'next-auth';
import { z } from 'zod';

import { signIn } from '@/auth-config';
import { Logger } from '@/lib/logger';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';
import { verifyTurnstile } from '@/lib/security/turnstile';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

const maskEmail = (email?: string | null) =>
  email && email.length > 2 ? `${email.substring(0, 2)}***@***` : 'unknown';

async function guard(email: string) {
  const ip = await getClientIp();

  const ipRl = rateLimit(`login:ip:${ip}`, 20, 10 * 60 * 1000);
  if (!ipRl.allowed) return { allowed: false as const, reason: 'Demasiados intentos desde esta IP.' };

  const emailRl = rateLimit(`login:email:${email}`, 10, 10 * 60 * 1000);
  if (!emailRl.allowed) return { allowed: false as const, reason: 'Demasiados intentos para esta cuenta.' };

  return { allowed: true as const, ip };
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) return 'Invalid credentials.';

  const g = await guard(parsed.data.email);
  if (!g.allowed) return g.reason;

  const captchaOk = await verifyTurnstile(
    formData.get('cf-turnstile-response') as string | null,
    g.ip,
  );
  if (!captchaOk) return 'Verificación anti-bot fallida';

  try {
    Logger.info({
      title: 'Login Attempt',
      message: 'User trying to authenticate.',
      metadata: { email: maskEmail(parsed.data.email) },
    });

    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return 'Success';
  } catch (error) {
    if (error instanceof AuthError) {
      Logger.warn({
        title: 'Login Warning',
        message: 'Auth error encountered.',
        metadata: { type: error.type, email: maskEmail(parsed.data.email) },
        error,
      });
      return 'Invalid credentials.';
    }

    Logger.error({
      title: 'Login Crash',
      message: 'Unexpected exception during login.',
      error,
    });
    throw error;
  }
}

export const login = async (email: string, password: string) => {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) return { ok: false, message: 'Credenciales inválidas' };

  const g = await guard(parsed.data.email);
  if (!g.allowed) return { ok: false, message: g.reason };

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    Logger.error({
      title: 'Direct Login Failed',
      message: 'No se pudo iniciar sesión',
      error,
    });
    return { ok: false, message: 'No se pudo iniciar sesión' };
  }
};
