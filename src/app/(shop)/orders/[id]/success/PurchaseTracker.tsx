"use client";

import { useEffect } from "react";

import { fbq } from "@/lib/fbpixel";

interface Props {
  orderId: string;
  total: number;
  contentIds: string[];
  numItems: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Browser-side Purchase pixel. Uses a deterministic eventID (`purchase_<orderId>`)
 * so Meta dedupes it against the server-side Purchase fired from the Mercado Pago
 * webhook (lib/meta/capi). The webhook is the source of truth; this is the
 * browser companion for match quality (fbp/fbc) and instant feedback.
 */
export const PurchaseTracker = ({ orderId, total, contentIds, numItems }: Props) => {
  useEffect(() => {
    window.gtag?.("event", "purchase", {
      transaction_id: orderId,
      currency: "COP",
      value: total,
    });

    fbq(
      "track",
      "Purchase",
      {
        currency: "COP",
        value: total,
        content_ids: contentIds,
        content_type: "product",
        num_items: numItems,
      },
      { eventID: `purchase_${orderId}` },
    );
  }, [orderId, total, contentIds, numItems]);

  return null;
};
