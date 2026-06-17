import prisma from "@/lib/prisma";

import { sendMetaServerEvent } from "./capi";

/**
 * Fire the server-side Purchase for an order via the Conversions API.
 * Shared by every payment webhook (Mercado Pago, Wompi) so the logic — and the
 * `purchase_<orderId>` event_id that dedupes against the browser pixel — lives
 * in one place. Call AFTER the order is marked paid. Never throws.
 */
export async function sendOrderPurchaseEvent(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      total: true,
      itemsInOrder: true,
      userId: true,
      fbp: true,
      fbc: true,
      user: { select: { email: true } },
      OrderAddress: { select: { email: true, phone: true } },
      OrderItem: { select: { productId: true, quantity: true } },
    },
  });
  if (!order) return;

  await sendMetaServerEvent({
    event_name: "Purchase",
    event_id: `purchase_${orderId}`,
    custom_data: {
      currency: "COP",
      value: order.total,
      num_items: order.itemsInOrder,
      content_type: "product",
      content_ids: order.OrderItem.map((item) => item.productId),
      contents: order.OrderItem.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
      })),
    },
    user_data: {
      email: order.OrderAddress?.email ?? order.user?.email ?? undefined,
      phone: order.OrderAddress?.phone ?? undefined,
      external_id: order.userId ?? undefined,
      fbp: order.fbp ?? undefined,
      fbc: order.fbc ?? undefined,
    },
  });
}
