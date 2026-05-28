"use client";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

// Utils
import { formatToCOP } from "@/utils";
import { useCartStore } from "@/store";
import { FREE_SHIPPING_THRESHOLD } from "@/config/shipping";

const OrderSummary = () => {
  const [loaded, setLoaded] = useState(false);

  const { itemsInCart, subTotal, shipping, total } = useCartStore(useShallow((state) => state.getSummaryInformation()));

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) return <p>Loading...</p>;

  return (
    <>
      {/* Barra de envío gratis */}
      <div className="mb-4">
        {subTotal >= FREE_SHIPPING_THRESHOLD ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 rounded-lg px-3 py-2">
            <span>🎉</span>
            <span>¡Envío gratis incluido!</span>
          </div>
        ) : (
          <div>
            <p className="text-xs text-brand-smoke mb-1">
              Te faltan <span className="font-bold text-brand-black">{formatToCOP(FREE_SHIPPING_THRESHOLD - subTotal)}</span> para envío gratis
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-brand-orange h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((subTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <span className="text-brand-smoke">No. Productos</span>
        <span className="text-right text-brand-black">{itemsInCart === 1 ? "1 producto" : `${itemsInCart} productos`}</span>

        <span className="text-brand-smoke">Subtotal</span>
        <span className="text-right text-brand-black">{formatToCOP(subTotal)}</span>

        <span className="text-brand-smoke">Envío</span>
        <span className="text-right">
          {shipping === 0
            ? <span className="text-green-600 font-semibold">Gratis</span>
            : <span className="text-brand-black">{formatToCOP(shipping)}</span>}
        </span>

        <span className="text-base font-bold text-brand-black border-t border-gray-200 pt-3 mt-1">Total</span>
        <span className="text-base font-bold text-brand-black text-right border-t border-gray-200 pt-3 mt-1">{formatToCOP(total)}</span>
      </div>
    </>
  );
};

export default OrderSummary;