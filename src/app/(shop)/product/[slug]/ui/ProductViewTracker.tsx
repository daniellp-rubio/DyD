"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

interface Props {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    images: string[];
  };
}

export const ProductViewTracker = ({ product }: Props) => {
  useEffect(() => {
    window.gtag?.("event", "view_item", {
      currency: "COP",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: product.price,
        },
      ],
    });

    window.fbq?.("track", "ViewContent", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      value: product.price,
      currency: "COP",
    });
  }, [product]);

  return null;
};
