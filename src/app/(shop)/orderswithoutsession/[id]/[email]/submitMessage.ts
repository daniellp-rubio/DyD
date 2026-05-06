"use server";

import crypto from "crypto";
import { z } from "zod";
import { MercadoPagoConfig, Preference } from "mercadopago";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const inputSchema = z.object({
  text: z.string().trim().min(1).max(120),
  id: z.string().uuid(),
  accessToken: z.string().min(20),
});

const hashToken = (raw: string) =>
  crypto.createHash("sha256").update(raw).digest("hex");

export async function submitMessage(
  text: string,
  id: string,
  _total: number,
  buyerEmail: string,
  accessToken: string,
): Promise<string> {
  const parsed = inputSchema.safeParse({ text, id, accessToken });
  if (!parsed.success) throw new Error("Solicitud inválida");

  const session = await auth();
  if (session?.user.id) throw new Error("Tienes una sesión activa");

  const order = await prisma.order.findFirst({
    where: {
      id: parsed.data.id,
      userId: null,
      guestAccessToken: hashToken(parsed.data.accessToken),
    },
    select: { id: true, total: true, isPaid: true },
  });
  if (!order) throw new Error("Orden no existe");
  if (order.isPaid) throw new Error("La orden ya fue pagada");

  const notificationUrl = `${process.env.MERCADOPAGO_NOTIFICATION_URL}/api/mercadopago/pagos`;
  const backUrl = `${process.env.MERCADOPAGO_NOTIFICATION_URL}`;
  const tokenParam = `token=${encodeURIComponent(parsed.data.accessToken)}`;
  const safeEmail = buyerEmail ? buyerEmail.trim().toLowerCase() : undefined;

  try {
    const preference = await new Preference(mercadopago).create({
      body: {
        items: [
          {
            id: order.id,
            title: `Orden #${order.id.split("-").at(-1)}`,
            quantity: 1,
            unit_price: order.total,
            currency_id: "COP",
          },
        ],
        payer: safeEmail ? { email: safeEmail } : undefined,
        metadata: { orderId: order.id, text: parsed.data.text },
        external_reference: order.id,
        back_urls: {
          success: `${backUrl}/orderswithoutsession/${order.id}/success?${tokenParam}`,
          failure: `${backUrl}/orderswithoutsession/${order.id}/failure?${tokenParam}`,
          pending: `${backUrl}/orderswithoutsession/${order.id}/pending?${tokenParam}`,
        },
        auto_return: "approved",
        statement_descriptor: "D&D Gadgets",
        notification_url: notificationUrl,
      },
    });

    if (!preference.init_point) throw new Error("No se pudo generar el link de pago");
    return preference.init_point;
  } catch (error) {
    Logger.error({
      title: "MP Preference Failed (guest)",
      message: "No se pudo crear la preferencia",
      error,
    });
    throw new Error("No se pudo crear la preferencia de pago");
  }
}
