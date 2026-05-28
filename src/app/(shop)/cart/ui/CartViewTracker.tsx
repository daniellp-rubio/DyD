"use client";

import { useEffect, useRef } from "react";

import { useCartStore } from "@/store";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export const CartViewTracker = () => {
  const cart = useCartStore(state => state.cart);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || cart.length === 0) return;
    fired.current = true;

    const value = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

    window.gtag?.("event", "view_cart", {
      currency: "COP",
      value,
      items: cart.map(p => ({
        item_id: p.id,
        item_name: p.title,
        price: p.price,
        quantity: p.quantity,
      })),
    });
    window.fbq?.("track", "ViewCart", {
      content_ids: cart.map(p => p.id),
      content_type: "product",
      contents: cart.map(p => ({ id: p.id, quantity: p.quantity })),
      value,
      currency: "COP",
    });
  }, [cart]);

  return null;
};
