"use client";

import { useState } from "react";

import { submitWompi } from "../submitWompi";

interface Props {
  orderId: string;
}

export const ButtonWompi = ({ orderId }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const url = await submitWompi(orderId);
      window.location.href = url;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo iniciar el pago.";
      alert(msg + " Intenta con otro método o contáctanos.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse mb-2 h-12 rounded-lg bg-gray-200" />;
  }

  return (
    <button
      onClick={handleCheckout}
      className="flex items-center justify-center gap-2.5 w-full h-12 rounded-lg bg-[#00AEEF] hover:bg-[#0090c8] text-white font-bold text-sm transition-colors mb-2 cursor-pointer"
    >
      {/* Wompi brand icon (card symbol) */}
      <svg
        width="20"
        height="16"
        viewBox="0 0 20 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="18" height="14" rx="2" stroke="white" strokeWidth="1.5" />
        <rect x="1" y="5" width="18" height="3" fill="white" />
        <rect x="3" y="11" width="5" height="1.5" rx="0.75" fill="white" />
      </svg>
      Pagar con Wompi
    </button>
  );
};
