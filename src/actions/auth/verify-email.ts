'use server';

import { consumeVerificationToken } from '@/lib/email/verification';
import { Logger } from '@/lib/logger';

export async function verifyEmailAction(token: string) {
  if (!token || typeof token !== 'string') {
    return { ok: false, message: 'Token inválido' };
  }

  try {
    const result = await consumeVerificationToken(token);
    if (!result.ok) {
      return { ok: false, message: 'Token inválido o expirado' };
    }
    return { ok: true, message: 'Correo verificado' };
  } catch (error) {
    Logger.error({
      title: 'Verify Email Crash',
      message: 'Fallo inesperado verificando correo',
      error,
    });
    return { ok: false, message: 'No se pudo verificar el correo' };
  }
}
