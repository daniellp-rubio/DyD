import Link from 'next/link';
import { verifyEmailAction } from '@/actions';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailAction(token)
    : { ok: false, message: 'Falta el token' };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {result.ok ? 'Correo verificado' : 'Verificación fallida'}
        </h1>
        <p className="text-slate-600 mb-6">{result.message}</p>
        <Link
          href={result.ok ? '/auth/login' : '/'}
          className="inline-block bg-palet-orange hover:bg-palet-hover-orange text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {result.ok ? 'Iniciar sesión' : 'Volver al inicio'}
        </Link>
      </div>
    </div>
  );
}
