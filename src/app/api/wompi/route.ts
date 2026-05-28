import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

const EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET;
// Tolerance in centavos (1 COP = 100 centavos)
const PRICE_TOLERANCE_CENTS = 100;

/**
 * Verify Wompi event checksum.
 * Spec: SHA-256(transaction.id + transaction.status + transaction.amount_in_cents + events_secret)
 * https://docs.wompi.co/docs/en/webhooks
 */
function verifyChecksum(
  transactionId: string,
  status: string,
  amountInCents: number,
  checksum: string,
): boolean {
  if (!EVENTS_SECRET) {
    if (process.env.NODE_ENV === "production") {
      Logger.error({
        title: "Wompi Webhook Misconfigured",
        message: "WOMPI_EVENTS_SECRET missing in production — rejecting all events",
      });
      return false;
    }
    // In development, skip verification to ease local testing
    return true;
  }

  const expected = createHash("sha256")
    .update(`${transactionId}${status}${amountInCents}${EVENTS_SECRET}`)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== checksum.length) return false;
  return createHash("sha256").update(expected).digest("hex") ===
    createHash("sha256").update(checksum).digest("hex");
}

export async function POST(req: NextRequest) {
  // Graceful degradation: if not configured, still return 200
  // so Wompi stops retrying — order will be manually confirmed.
  if (!EVENTS_SECRET && process.env.NODE_ENV !== "production") {
    Logger.warn({
      title: "Wompi Webhook Dev Mode",
      message: "WOMPI_EVENTS_SECRET not set — processing without verification",
    });
  }

  let body: {
    event?: string;
    data?: {
      transaction?: {
        id?: string;
        status?: string;
        amount_in_cents?: number;
        reference?: string;
        signature?: { checksum?: string };
      };
    };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const tx = body?.data?.transaction;

  // Only handle transaction.updated events
  if (!tx || body.event !== "transaction.updated") {
    return NextResponse.json({ ignored: true });
  }

  const { id, status, amount_in_cents, reference, signature } = tx;
  const checksum = signature?.checksum;

  if (!id || !status || amount_in_cents == null || !reference || !checksum) {
    Logger.warn({
      title: "Wompi Webhook Missing Fields",
      message: `Event missing required fields`,
      metadata: { id, status, reference, hasChecksum: !!checksum },
    });
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (!verifyChecksum(id, status, amount_in_cents, checksum)) {
    Logger.warn({
      title: "Wompi Webhook Rejected",
      message: "Invalid checksum",
      metadata: { transactionId: id },
    });
    return NextResponse.json({ error: "invalid_checksum" }, { status: 401 });
  }

  // Only APPROVED transitions mark the order as paid
  if (status !== "APPROVED") {
    Logger.info({
      title: "Wompi Webhook Non-Approved",
      message: `Transaction ${id} status: ${status}`,
      metadata: { reference },
    });
    return NextResponse.json({ ignored: true, status });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: reference },
      select: { id: true, total: true, isPaid: true, transactionId: true },
    });

    if (!order) {
      Logger.warn({
        title: "Wompi Webhook Unknown Order",
        message: `Order not found for reference ${reference}`,
      });
      // Return 200 to prevent Wompi from retrying endlessly
      return NextResponse.json({ received: true, note: "order_not_found" });
    }

    // Idempotency: already processed
    if (order.transactionId === id && order.isPaid) {
      return NextResponse.json({ received: true, idempotent: true });
    }

    // Amount mismatch protection
    const expectedCents = Math.round(order.total) * 100;
    if (Math.abs(amount_in_cents - expectedCents) > PRICE_TOLERANCE_CENTS) {
      Logger.error({
        title: "Wompi Webhook Amount Mismatch",
        message: "Paid amount differs from order total",
        metadata: { reference, paidCents: amount_in_cents, expectedCents },
      });
      return NextResponse.json({ received: true, note: "amount_mismatch" });
    }

    await prisma.order.update({
      where: { id: reference },
      data: {
        transactionId: id,
        isPaid: true,
        paidAt: new Date(),
      },
    });

    Logger.info({
      title: "Wompi Order Paid",
      message: `Order ${reference} marked as paid`,
      metadata: { transactionId: id, amountCents: amount_in_cents },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    Logger.error({
      title: "Wompi Webhook Crash",
      message: "Unhandled error processing transaction",
      error,
    });
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
