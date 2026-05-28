import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = emailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const { email } = parsed.data;

    console.log('[Newsletter] New subscriber:', email);

    // Optional: if RESEND_API_KEY exists, send welcome email with coupon
    if (process.env.RESEND_API_KEY) {
      // TODO: implement Resend welcome email with coupon BIENVENIDO10
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({ from: 'DYD Tech <hola@dydtech.com>', to: email, ... });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Newsletter] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
