"use client";

import { useEffect } from "react";

export const AddressTracker = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // GA4
      (window as any).gtag?.("event", "begin_checkout", {
        currency: "COP",
      });

      // Meta Pixel
      window.fbq?.("track", "InitiateCheckout", {
        currency: "COP",
      });

      console.log("Evento begin_checkout enviado 🚀");
    }
  }, []);

  return null;
};
