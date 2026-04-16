"use client";

import { useEffect } from "react";

interface Props {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    images: string[];
  };
};

export const ProductViewTracker = ({ product }: Props) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Google Analytics 4 (ejemplo con gtag)
      (window as any).gtag?.("event", "view_item", {
        currency: "COP",
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            item_brand: "Mi Marca",
            price: product.price,
          },
        ],
      });

      // Meta Pixel (ejemplo)
      if (typeof window !== "undefined") {
        if (typeof (window as any).fbq !== "function") {
          console.warn("⚠️ fbq aún no está disponible");
          return;
        };

        window.fbq("track", "ViewContent", {
          content_ids: [product.id],
          content_name: product.title,
          content_type: "product",
          value: product.price,
          currency: "COP",
        });
      };

    };
  }, [product]);

  return null;
};
