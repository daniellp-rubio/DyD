import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

/**
 * Abandoned cart email cron.
 *
 * Finds orders that:
 *  - are NOT paid
 *  - were created between 1h and 7 days ago
 *  - have a reachable email (via user or OrderAddress)
 *
 * Sends a reminder via Resend.
 *
 * Graceful degradation: if RESEND_API_KEY is not set, logs and returns 200.
 * Protected by CRON_SECRET (same pattern as other cron routes).
 *
 * Invoke: GET /api/cron/abandoned-cart
 * Headers: Authorization: Bearer {CRON_SECRET}
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hola@dydtech.com";
  const siteUrl = (
    process.env.MERCADOPAGO_NOTIFICATION_URL ??
    process.env.NEXTAUTH_URL ??
    "https://dydtech.com"
  ).replace(/\/$/, "");

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let abandonedOrders: {
    id: string;
    total: number;
    createdAt: Date;
    user: { email: string; name: string } | null;
    OrderAddress: { firstName: string; email: string | null } | null;
    OrderItem: { quantity: number; product: { title: string } }[];
  }[];

  try {
    abandonedOrders = await prisma.order.findMany({
      where: {
        isPaid: false,
        createdAt: { lte: oneHourAgo, gte: sevenDaysAgo },
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
        OrderAddress: { select: { firstName: true, email: true } },
        OrderItem: {
          select: {
            quantity: true,
            product: { select: { title: true } },
          },
          take: 5, // limit items listed in email
        },
      },
      take: 50, // safety cap per run
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    Logger.error({
      title: "AbandonedCart Cron DB Error",
      message: "Failed to query abandoned orders",
      error,
    });
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (abandonedOrders.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, reason: "none_found" });
  }

  if (!resendKey) {
    Logger.warn({
      title: "AbandonedCart Cron — No Resend Key",
      message: `${abandonedOrders.length} abandoned order(s) found but RESEND_API_KEY not set`,
      metadata: { orderIds: abandonedOrders.map((o) => o.id) },
    });
    return NextResponse.json({
      ok: true,
      skipped: abandonedOrders.length,
      reason: "no_resend_key",
    });
  }

  let sent = 0;
  let failed = 0;
  let noEmail = 0;

  for (const order of abandonedOrders) {
    const email = order.user?.email ?? order.OrderAddress?.email;
    const name =
      order.user?.name ??
      order.OrderAddress?.firstName ??
      "Cliente";

    if (!email) {
      noEmail++;
      continue;
    }

    const itemList = order.OrderItem.map(
      (i) => `<li>${i.quantity}× ${i.product.title}</li>`,
    ).join("");

    const totalFormatted = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(order.total);

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:100%;">
        <tr>
          <td style="background:#FF6B00;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">DYD Tech</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">
              ¡Hola ${name}! ¿Sigues interesado?
            </h2>
            <p style="color:#555;margin:0 0 20px;line-height:1.6;">
              Dejaste estos productos en tu carrito sin completar el pago:
            </p>
            <ul style="color:#1a1a1a;font-weight:600;margin:0 0 20px;padding-left:20px;line-height:2;">
              ${itemList}
            </ul>
            <p style="color:#555;margin:0 0 8px;">
              <strong style="color:#1a1a1a;">Total: ${totalFormatted}</strong>
            </p>
            <p style="color:#555;margin:0 0 28px;font-size:13px;">
              🚚 Entrega en 2-3 días hábiles a todo Colombia
            </p>
            <a href="${siteUrl}/orders/${order.id}"
               style="display:inline-block;background:#FF6B00;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:800;font-size:15px;">
              Completar mi pedido →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;color:#aaa;font-size:11px;">
              DYD Tech · Medellín, Colombia ·
              <a href="${siteUrl}" style="color:#aaa;">dydtech.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `DYD Tech <${fromEmail}>`,
          to: email,
          subject: `${name}, ¿completamos tu pedido? 🛒`,
          html,
        }),
      });

      if (res.ok) {
        sent++;
      } else {
        failed++;
        const errBody = await res.text().catch(() => "");
        Logger.warn({
          title: "AbandonedCart Email Failed",
          message: `Order ${order.id} — HTTP ${res.status}`,
          metadata: { email, body: errBody.slice(0, 200) },
        });
      }
    } catch (err) {
      failed++;
      Logger.error({
        title: "AbandonedCart Email Crash",
        message: `Order ${order.id}`,
        error: err,
      });
    }
  }

  Logger.info({
    title: "AbandonedCart Cron Done",
    message: `sent=${sent} failed=${failed} noEmail=${noEmail} total=${abandonedOrders.length}`,
  });

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    noEmail,
    total: abandonedOrders.length,
  });
}
