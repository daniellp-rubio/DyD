"use client";

import { getStockBySlug } from "@/actions";
import { useEffect, useState } from "react";
import { IoCheckmarkCircle, IoCloseCircle, IoAlertCircle } from "react-icons/io5";

interface Props {
  slug: string;
  className?: string;
}

const StockLabel = ({ slug, className = "" }: Props) => {
  const [stock, setStock] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getStockBySlug(slug).then(s => {
      if (active) setStock(s);
    });
    return () => { active = false; };
  }, [slug]);

  if (stock === null) {
    return (
      <div className={`h-5 w-32 bg-gray-200 animate-pulse rounded ${className}`} aria-busy="true" />
    );
  }

  const isOut = stock === 0;
  const isLow = stock > 0 && stock <= 5;

  return (
    <p
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
        isOut ? "text-brand-smoke" : isLow ? "text-brand-orange" : "text-green-600"
      } ${className}`}
      aria-live="polite"
    >
      {isOut ? (
        <>
          <IoCloseCircle size={16} /> Agotado
        </>
      ) : isLow ? (
        <>
          <IoAlertCircle size={16} /> ¡Solo {stock} disponibles!
        </>
      ) : (
        <>
          <IoCheckmarkCircle size={16} /> En stock ({stock} disponibles)
        </>
      )}
    </p>
  );
};

export default StockLabel;
