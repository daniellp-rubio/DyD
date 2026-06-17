"use client";

import { useEffect } from "react";

import { useCartStore } from "@/store";
import { trackMeta } from "@/lib/fbpixel";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const AddressTracker = () => {
  useEffect(() => {
    const { cart, getSummaryInformation } = useCartStore.getState();
    const { total } = getSummaryInformation();
    const numItems = cart.reduce((n, item) => n + item.quantity, 0);

    window.gtag?.("event", "begin_checkout", { currency: "COP", value: total });

    trackMeta("InitiateCheckout", {
      currency: "COP",
      value: total,
      num_items: numItems,
      content_type: "product",
      content_ids: cart.map((item) => item.id),
      contents: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
    });
  }, []);

  return null;
};
