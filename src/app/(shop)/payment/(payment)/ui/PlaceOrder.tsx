"use client";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import clsx from "clsx";

// Actions
import { placeOrderWithoutSession } from "@/actions/order/place-order-without-session";

// Store
import { useCartStore } from "@/store";
import { useAddressWithoutSessionStore } from "@/store/address-without-session/address-without-session";

// Utils
import { formatToCOP } from "@/utils";

const PlaceOrder = () => {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const address = useAddressWithoutSessionStore(state => state.address);

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

    const resp = await placeOrderWithoutSession(productsToOrder, address);
    if (!resp.ok) {
      setIsPlacingOrder(false);
      setErrorMessage(resp.message!);
      return;
    };

    await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        to: address.email,
        subject: "Confirmación para pago - tu pedido GADGETSD&D",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FFA500;">Hola, ${address.firstName} 👋</h2>

            <p>Gracias por realizar tu pedido con <strong>GADGETS D&D</strong>. Hemos recibido tu solicitud con el número de pedido <strong>#${resp.order!.id}</strong>.</p>

            <p>A continuación te compartimos los datos que ingresaste en el formulario. Por favor, revísalos cuidadosamente:</p>

            <ul style="line-height: 1.6;">
              <li><strong>Dirección:</strong> ${address.address}${address?.address2 ? ', ' + address.address2 : ''}</li>
              <li><strong>Código postal:</strong> ${address.postalCode}</li>
              <li><strong>Ciudad:</strong> ${address.city}</li>
              <li><strong>Teléfono:</strong> ${address.phone}</li>
            </ul>

            <p style="margin-top: 20px;">El total a pagar por tu pedido es de: <strong style="font-size: 1.2em;">$${resp.order!.total.toLocaleString()}</strong></p>

            <p>Si alguno de los datos es incorrecto, por favor vuelve a realizar el pedido ya que este no puede ser modificado por seguridad para asegurarte de que podamos entregarlo correctamente.</p>

            <p style="margin-top: 30px;">Gracias por confiar en nosotros.<br/>El equipo de <strong>GADGETS D&D</strong></p>

            <hr style="margin: 40px 0; border: none; border-top: 1px solid #ccc;" />

            <p style="font-size: 0.85em; color: #888;">
              Este correo es una confirmación automática. Por favor, no respondas a este mensaje.
            </p>
          </div>
        `
      })
    });

    clearCart();
    router.replace(`/orderswithoutsession/${resp.order!.id}?email=${encodeURIComponent(address.email)}`);
  };

  if (!loaded) return null;

  return (
    <div className="bg-palet-found-black rounded-xl shadow-xl p-7">
      <h2 className="text-2xl mb-2">Direccion de entrega</h2>
      <div className="mb-10">
        <p className="text-xl">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.email}</p>
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