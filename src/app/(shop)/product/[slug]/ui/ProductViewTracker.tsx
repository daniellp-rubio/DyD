"use client";

import { useEffect } from "react";

import { trackMeta } from "@/lib/fbpixel";

declare global {
  interface Window {
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

    trackMeta("ViewContent", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      contents: [{ id: product.id, quantity: 1 }],
      value: product.price,
      currency: "COP",
    });
  }, [product]);

  return null;
};
