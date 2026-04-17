import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { setTransactionId } from '@/actions';
import prisma from '@/lib/prisma';
import { setPaidId } from '@/actions/payments/set-paid-at';

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  let topic: string | null = null;
  let resourceId: string | null = null;

  // Intentar leer primero desde query params (modo antiguo)
  const searchParams = req.nextUrl.searchParams;
  topic = searchParams.get('topic');
  resourceId = searchParams.get('id');

  // Si no se encontró en query, leer desde el body JSON (modo moderno)
  if (!topic || !resourceId) {
    try {
      const body = await req.json();
      topic = body.type;
      resourceId = body.data?.id?.toString();
    } catch (e) {
      console.warn("⚠️ No se pudo leer el body JSON:", e);
    };
  };

  console.log('📥 Webhook recibido');
  console.log('🔍 Tipo:', topic);
  console.log('🔍 ID:', resourceId);

  if (topic !== 'payment' || !resourceId) {
    console.warn('⚠️ Webhook ignorado. No es de tipo "payment" o falta ID.');
    return NextResponse.json({ ignored: true });
  };

  try {
    const payment = await safeGetPayment(resourceId);
    await handleApprovedPayment(payment);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Error al procesar webhook:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  };
};

async function handleApprovedPayment(payment: any) {
  console.log('✅ Detalles del pago:');
  console.log('🆔 ID:', payment.id);
  console.log('💰 Monto:', payment.transaction_amount);
  console.log('📧 Email:', payment.payer?.email);
  console.log('📦 Estado:', payment.status);

  if (payment.status !== 'approved') {
    console.log('ℹ️ Pago recibido pero no aprobado:', payment.status);
    return;
  };

  const orderId = payment.metadata?.orderId ?? payment.external_reference;
  if (!orderId) {
    console.warn('⚠️ No se encontró orderId en metadata del pago');
    return;
  };

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (order?.transactionId === payment.id) {
    console.log('ℹ️ Orden ya procesada con este transactionId, no se repite la acción.');
    return;
  };

  const result = await setTransactionId(orderId, String(payment.id));
  if (!result.ok) {
    console.error('❌ Error al actualizar la orden:', result.message);
  } else {
    console.log('✅ Orden actualizada con transactionId:', payment.id);

    const paymentSearch = await new Payment(mercadopago).get({ id: payment.id });
    if (paymentSearch.status === "approved") {
      const resultPaid = await setPaidId(orderId, new Date(), true)
      if (!resultPaid.ok) {
        console.error('❌ Error al actualizar la orden:', result.message);
      } else {
        console.log('✅ Orden paid actualizada con transactionId:', payment.id);
      };
    } else {
      const resultPaid = await setPaidId(orderId, new Date(), false)
      if (!resultPaid.ok) {
        console.error('❌ Error al actualizar la orden:', result.message);
      } else {
        console.log('✅ Orden paid actualizada con transactionId:', payment.id);
      };
    };
  };
};

async function safeGetPayment(paymentId: string, retries = 3, delay = 1500): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const payment = await new Payment(mercadopago).get({ id: paymentId });
      return payment;
    } catch (err: any) {
      if (err.status === 404 && i < retries - 1) {
        console.log(`⌛ Reintentando (${i + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      };
    };
  };
  throw new Error(`No se pudo obtener el pago ${paymentId} después de ${retries} intentos`);
};
