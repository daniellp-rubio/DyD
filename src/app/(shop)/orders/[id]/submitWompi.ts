"use server";

import { createHash } from "crypto";
import { z } from "zod";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export async function submitWompi(orderId: string): Promise<string> {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

  if (!publicKey || !integritySecret) {
    throw new Error("Pasarela de pago no configurada");
  }

  const parsed = z.string().uuid().safeParse(orderId);
  if (!parsed.success) throw new Error("ID de orden inválido");

  const session = await auth();
  if (!session?.user.id) throw new Error("No autenticado");

  const order = await prisma.order.findFirst({
    where: { id: parsed.data, userId: session.user.id },
    select: { id: true, total: true, isPaid: true },
  });

  if (!order) throw new Error("Orden no encontrada");
  if (order.isPaid) throw new Error("Esta orden ya fue pagada");

  // Wompi requires integer centavos. 1 COP = 100 centavos.
  const amountInCents = Math.round(order.total) * 100;
  const reference = order.id;
  const currency = "COP";

  const baseUrl =
    process.env.MERCADOPAGO_NOTIFICATION_URL ??
    process.env.NEXTAUTH_URL ??
    "";

  // Integrity signature: SHA-256(reference + amount_in_cents + currency + integrity_secret)
  const signatureString = `${reference}${amountInCents}${currency}${integritySecret}`;
  const signature = createHash("sha256").update(signatureString).digest("hex");

  const params = new URLSearchParams({
    "public-key": publicKey,
    currency,
    "amount-in-cents": String(amountInCents),
    reference,
    "signature:integrity": signature,
    "redirect-url": `${baseUrl}/orders/${order.id}/success`,
  });

  Logger.info({
    title: "Wompi Checkout Created",
    message: `Order ${order.id} — ${amountInCents} centavos`,
  });

  return `https://checkout.wompi.co/p/?${params.toString()}`;
}
