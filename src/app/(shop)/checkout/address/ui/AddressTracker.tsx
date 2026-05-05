"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export const AddressTracker = () => {
  useEffect(() => {
    window.gtag?.("event", "begin_checkout", { currency: "COP" });
    window.fbq?.("track", "InitiateCheckout", { currency: "COP" });
  }, []);

  return null;
};
