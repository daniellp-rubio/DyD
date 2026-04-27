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

const PlaceOrder = () => {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const address = useAddressStore(state => state.address);

  const { itemsInCart, subTotal, total } = useCartStore(useShallow((state) => state.getSummaryInformation()));

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

    const resp = await placeOrder(productsToOrder, address);
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
    <div className="bg-palet-found-black rounded-xl shadow-xl p-7">
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

        <span>Total</span>
        <span className="text-right">{formatToCOP(total)}</span>
      </div>

      <div className="mt-5 mb-2 w-full">
        <span className="text-sx">
          Al ordenar aceptas nuestros <a href="/termsandconditions" className="underline">términos y condiciones</a> y <a href="/termsandconditions" className="underline">pólitica de privacidad</a>
        </span>

        <p className="text-red-500">{errorMessage}</p>

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