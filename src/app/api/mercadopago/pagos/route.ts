import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { sendOrderPurchaseEvent } from "@/lib/meta/purchase";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;
const PRICE_TOLERANCE = 0.01;

function timingSafeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length || ba.length === 0) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * Validate Mercado Pago webhook signature.
 * https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/webhooks#signature-validation
 */
function verifySignature(
  signatureHeader: string | null,
  requestId: string | null,
  dataId: string | null,
): boolean {
  if (!WEBHOOK_SECRET) {
    if (process.env.NODE_ENV === "production") {
      Logger.error({
        title: "MP Webhook Misconfigured",
        message: "MERCADOPAGO_WEBHOOK_SECRET missing in production",
      });
      return false;
    }
    return true;
  }

  if (!signatureHeader || !requestId || !dataId) return false;

  const parts = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((p) => p.trim().split("="))
      .filter((kv) => kv.length === 2)
      .map(([k, v]) => [k.trim(), v.trim()]),
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET).update(manifest).digest("hex");

  return timingSafeEqualHex(hmac, v1);
}

export async function POST(req: NextRequest) {
  let topic: string | null = null;
  let resourceId: string | null = null;

  const searchParams = req.nextUrl.searchParams;
  topic = searchParams.get("topic") ?? searchParams.get("type");
  resourceId = searchParams.get("id") ?? searchParams.get("data.id");

  let body: { type?: string; data?: { id?: string | number } } | undefined;
  try {
    body = await req.json();
    topic = topic ?? body?.type ?? null;
    resourceId = resourceId ?? (body?.data?.id ? String(body.data.id) : null);
  } catch {
    // No JSON body — relying on query params only.
  }

  const signatureHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");

  if (!verifySignature(signatureHeader, requestId, resourceId)) {
    Logger.warn({
      title: "MP Webhook Rejected",
      message: "Invalid signature",
      metadata: { requestId, hasSignature: !!signatureHeader },
    });
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (topic !== "payment" || !resourceId) {
    return NextResponse.json({ ignored: true });
  }

  try {
    const payment = await safeGetPayment(resourceId);
    await handleApprovedPayment(payment);
    return NextResponse.json({ received: true });
  } catch (error) {
    Logger.error({
      title: "MP Webhook Crash",
      message: "Error procesando webhook",
      error,
    });
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

interface MpPayment {
  id?: string | number;
  status?: string;
  transaction_amount?: number;
  external_reference?: string | null;
  metadata?: { orderId?: string } | null;
}

async function handleApprovedPayment(payment: MpPayment) {
  if (payment.status !== "approved") return;

  const orderId = payment.metadata?.orderId ?? payment.external_reference;
  if (!orderId) {
    Logger.warn({
      title: "MP Webhook Missing Order",
      message: "Payment sin orderId",
      metadata: { paymentId: String(payment.id) },
    });
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, total: true, isPaid: true, transactionId: true },
  });

  if (!order) {
    Logger.warn({
      title: "MP Webhook Unknown Order",
      message: "orderId no existe",
      metadata: { orderId },
    });
    return;
  }

  if (order.transactionId === String(payment.id) && order.isPaid) {
    return; // idempotent
  }

  const paid = Number(payment.transaction_amount ?? 0);
  if (Math.abs(paid - order.total) > PRICE_TOLERANCE) {
    Logger.error({
      title: "MP Webhook Amount Mismatch",
      message: "Monto pagado distinto al total de la orden",
      metadata: { orderId, paid, expected: order.total },
    });
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      transactionId: String(payment.id),
      isPaid: true,
      paidAt: new Date(),
    },
  });

  // Server-side Purchase (deduped vs the browser pixel by purchase_<orderId>).
  await sendOrderPurchaseEvent(orderId);
}

async function safeGetPayment(paymentId: string, retries = 3, delayMs = 1500): Promise<MpPayment> {
  for (let i = 0; i < retries; i++) {
    try {
      const payment = (await new Payment(mercadopago).get({ id: paymentId })) as unknown as MpPayment;
      return payment;
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 404 && i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
  throw new Error(`No se pudo obtener el pago ${paymentId}`);
}
