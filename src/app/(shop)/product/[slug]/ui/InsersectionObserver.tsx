"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Components
import AddToCart from "./AddToCart";

// Utils
import { formatToCOP } from "@/utils";

// Types
import type { Product } from "@/interfaces";

interface Props {
  product: Product;
};

const InsersectionObserver = ({ product }: Props) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShow(true);
      } else {
        setShow(false);
      };
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-palet-orange-dyd shadow-lg border-t border-palet-orange-dyd transition-transform duration-300 ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Image
          src={product.images[2]}
          alt={product.title}
          width={300}
          height={300}
          className="rounded-md object-cover hidden md:block"
        />
        <div className="hidden md:block">
          <p className="font-semibold text-white">{product.title}</p>
          <div className="flex items-center gap-2 mb-5">
            {/* Precio actual */}
            <span className="text-white font-bold text-lg">
              {formatToCOP(product.price)}
            </span>
            {/* Precio anterior tachado */}
            <span className="text-gray-300 line-through text-md">
              {formatToCOP(product.priceInOffer)}
            </span>
          </div>
        </div>

        <AddToCart product={product} mode="insersectionObserver" />
      </div>
    </div>
  );
};

export default InsersectionObserver;
