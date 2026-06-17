"use client";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import clsx from "clsx";

// Actions
import { placeOrder } from "@/actions";

// Store
import { useAddressStore, useCartStore } from "@/store";

// Utils
import { formatToCOP } from "@/utils";
import { getCookie } from "@/lib/fbpixel";

const PlaceOrder = () => {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const address = useAddressStore(state => state.address);

  const { itemsInCart, subTotal, shipping, total } = useCartStore(useShallow((state) => state.getSummaryInformation()));

  const cart = useCartStore(state => state.cart);
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const onPlaceOrder = async() => {
    setIsPlacingOrder(true);

    const productsToOrder = cart.map(product => ({
      productId: product.id,
      quantity: product.quantity
    }));

    const resp = await placeOrder(productsToOrder, address, {
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
    });
    if (!resp.ok) {
      setIsPlacingOrder(false);
      setErrorMessage(resp.message!);
      return;
    };

    clearCart();
    router.replace("/orders/" + resp.order!.id)
  };

  if (!loaded) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-xl p-7">
      <h2 className="text-2xl mb-2">Direccion de entrega</h2>
      <div className="mb-10">
        <p className="text-xl">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.address}</p>
        <p>{address.address2}</p>
        <p>{address.postalCode}</p>
        <p>{address.city}</p>
        <p>{address.phone}</p>
      </div>

      <div className="w-full h-0.5 rounded bg-gray-200 mb-10" />

      <h2 className="text-2xl mb-2">Resumen de orden</h2>

      <div className="grid grid-cols-2">
        <span>No. Productos</span>
        <span className="text-right">{itemsInCart === 1 ? "1 producto" : `${itemsInCart} productos`}</span>

        <span>Subtotal</span>
        <span className="text-right">{formatToCOP(subTotal)}</span>

        <span>Envío</span>
        <span className="text-right">
          {shipping === 0
            ? <span className="text-green-600 font-semibold">Gratis</span>
            : formatToCOP(shipping)}
        </span>

        <span className="font-bold">Total</span>
        <span className="text-right font-bold">{formatToCOP(total)}</span>
      </div>

      <div className="mt-5 mb-2 w-full">
        <span className="text-xs">
          Al ordenar aceptas nuestros <a href="/termsandconditions" className="underline">términos y condiciones</a> y <a href="/privacy-policy" className="underline">política de privacidad</a>
        </span>

        <p className="text-red-500">{errorMessage}</p>

        <div className="flex flex-wrap gap-3 mt-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-brand-smoke">
            <span className="text-green-500">🔒</span> Pago 100% seguro
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-smoke">
            <span>✓</span> Garantía 12 meses
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-smoke">
            <span>↩</span> Devolución 30 días
          </div>
        </div>

        <button
          // href="orders/123"
          onClick={onPlaceOrder}
          className={
            clsx({
              "btn-primary": !isPlacingOrder,
              "btn-disabled": isPlacingOrder
            })
          }
        >
          Ordenar
        </button>
      </div>
    </div>
  );
};

export default PlaceOrder;