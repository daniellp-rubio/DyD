'use server';

import { signIn } from '@/auth-config';
import { AuthError } from 'next-auth';
import { Logger } from '@/lib/logger';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    // Log auth intent
    Logger.info({
      title: 'Login Attempt',
      message: 'A user is trying to authenticate via UI form.',
      metadata: { email: email ? email.substring(0, 3) + '***@***' : 'Unknown' }
    });

    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirect: false,
    });

    Logger.info({
      title: 'Login Success',
      message: 'User authenticated successfully via UI.',
      metadata: { email: email ? email.substring(0, 3) + '***@***' : 'Unknown' }
    });

    return "Sucess";
  } catch (error) {
    if (error instanceof AuthError) {
      Logger.warn({
        title: 'Login Warning',
        message: 'Auth Error encountered.',
        metadata: { 
          type: error.type,
          message: error.message,
          cause: String(error.cause)
        },
        error // Pasamos el objecto nativo a Discord Transport
      });

      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      };
    };

    Logger.error({
      title: 'Login Crash',
      message: 'An unexpected exception occurred during UI login.',
      error
    });
    throw error;
  };
};

export const login = async(email: string, password: string) => {
  try {
    Logger.info({
      title: 'Direct Login Attempt',
      message: 'Authenticating direct credentials.',
      metadata: { email: email.substring(0, 3) + '***@***' }
    });
    await signIn('credentials', {email, password});
    return {
      ok: true
    }
  } catch (error) {
    Logger.error({
      title: 'Direct Login Failed',
      message: 'No se pudo iniciar sesión',
      error
    });
    return {
      ok: false,
      message: "No se pudo iniciar sesión"
    }
  }
};