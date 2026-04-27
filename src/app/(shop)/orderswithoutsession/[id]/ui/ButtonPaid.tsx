"use client";

import { useState } from "react";

// Components
import { If } from "@/components";
import { submitMessage } from "../[email]/submitMessage";

// Icons
import { SiMercadopago } from "react-icons/si";

interface Props {
  title: string,
  id: string,
  total: number,
  isPaid: boolean,
  buyerEmail: string
};

export const ButtonPaid = ({ title, id, total, isPaid, buyerEmail }: Props) => {
  const [loading, setLoading] = useState(false);
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const url = await submitMessage(title, id, total, buyerEmail);
      window.location.href = url;
    } catch (error) {
      console.error("Error al iniciar el pago:", error);
      alert("No se pudo iniciar el pago. Intenta nuevamente.");
    } finally {
      setLoading(false);
    };
  };

  return (
    <>
      <If condition={loading}>
        <div className="animate-pulse mb-4">
          <div className="h-8 bg-gray-300 rounded" />
        </div>

        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded" />
        </div>
      </If>

      <If condition={!loading}>
        <button
          onClick={handleCheckout}
          className="flex items-center gap-1.5 justify-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg mb-4 w-full transition duration-200 cursor-pointer h-12"
        >
          <SiMercadopago color="black" size={40} />
          <span className="text-base font-medium">Pagar con Mercado Pago</span>
        </button>
      </If>
    </>
  );
};