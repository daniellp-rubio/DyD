"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Icons
import { FaCheckCircle } from "react-icons/fa";

// Seed
import { data } from "./data";

export const PurchasePopup = () => {
  const [visible, setVisible] = useState(false);
  const [client, setClient] = useState({
    name: "",
    product: "",
    productImage: "",
    city: "",
    date: "",
    verified: false
  });

  useEffect(() => {
    const FirstDelay = 10000;
    const showMs = 10000;
    const gapMs = 10000;

    let firstTimeout: ReturnType<typeof setTimeout> | null = null;
    let showTimeout: ReturnType<typeof setTimeout> | null = null;
    let gapTimeout: ReturnType<typeof setTimeout> | null = null;
    let prevIndex = -1

    const pickRandom = () => {
      let idx = Math.floor(Math.random() * data.length);
      if (data.length > 1 && idx === prevIndex) {
        idx = (idx + 1) % data.length;
      };
      prevIndex = idx;
      return data[idx]
    };

    const cycle = () => {
      setClient(pickRandom());
      setVisible(true);
      showTimeout = setTimeout(() => {
        setVisible(false);
        gapTimeout = setTimeout(cycle, gapMs);
      }, showMs);
    };

    firstTimeout = setTimeout(cycle, FirstDelay)

    return () => {
      if (firstTimeout) clearTimeout(firstTimeout);
      if (showTimeout) clearTimeout(showTimeout);
      if (gapTimeout) clearTimeout(gapTimeout);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-5 left-5 max-w-xs w-[360px] bg-white shadow-lg rounded-xl border p-3 flex gap-3 items-start transition-all duration-500 z-50 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      <Image
        src={client.productImage || "favicon.svg"}
        alt="D&D"
        width={80}
        height={80}
        className="rounded-md object-cover"
      />

      <div className="flex-1 text-sm">
        <p className="text-gray-700 font-medium">
          {client.name} compró
        </p>
        <p  className="font-semibold text-gray-900">{client.product}<span className="text-gray-500"> en Medellín</span></p>
        <div className ="flex items-center gap-2 text-xs text-gray-500 mt-1">
          {client.date}
          {client.verified ? <><FaCheckCircle /> <span>Verificado</span></> : ""}
        </div>
      </div>
    </div>
  );
};
