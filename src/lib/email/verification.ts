import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendEmail } from './send-email';

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function issueVerificationToken(userId: string) {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.create({
    data: { tokenHash, userId, expiresAt },
  });

  return token;
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000';
  const link = `${baseUrl}/auth/verify?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to: email,
    subject: 'Verifica tu correo — DYD Tech',
    html: `<p>Confirma tu correo haciendo clic en el enlace:</p>
           <p><a href="${link}">${link}</a></p>
           <p>Este enlace expira en 24 horas.</p>`,
    text: `Confirma tu correo: ${link} (expira en 24h)`,
  });
}

export async function consumeVerificationToken(token: string) {
  const tokenHash = hashToken(token);

  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false as const };
  }

  await prisma.$transaction([
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
  ]);

  return { ok: true as const, userId: record.userId };
}
