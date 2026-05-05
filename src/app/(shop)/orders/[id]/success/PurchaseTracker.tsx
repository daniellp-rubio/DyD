"use client";

import { useEffect } from "react";

interface Props {
  orderId: string;
  total: number;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export const PurchaseTracker = ({ orderId, total }: Props) => {
  useEffect(() => {
    window.gtag?.("event", "purchase", {
      transaction_id: orderId,
      currency: "COP",
      value: total,
    });
    window.fbq?.("track", "Purchase", {
      currency: "COP",
      value: total,
    });
  }, [orderId, total]);

  return null;
};
