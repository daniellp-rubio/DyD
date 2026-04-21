"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaFire } from "react-icons/fa";

import { Product } from "@/interfaces";
import { formatToCOP } from "@/utils";

interface Props {
  products: Product[];
}

export const BestSellers = ({ products }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="w-full bg-brand-gray py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-brand-orange text-sm font-bold uppercase tracking-wider">
              <FaFire /> Lo más vendido
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mt-2">
              Best Sellers
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              aria-label="Anterior"
              onClick={() => scroll("left")}
              className="w-11 h-11 rounded-full bg-brand-white border border-gray-200 hover:bg-brand-orange hover:text-brand-white hover:border-brand-orange text-brand-black flex items-center justify-center transition-all shadow-sm"
            >
              <FaChevronLeft />
            </button>
            <button
              aria-label="Siguiente"
              onClick={() => scroll("right")}
              className="w-11 h-11 rounded-full bg-brand-white border border-gray-200 hover:bg-brand-orange hover:text-brand-white hover:border-brand-orange text-brand-black flex items-center justify-center transition-all shadow-sm"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 sm:-mx-10 sm:px-10 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          {products.map((product, i) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="snap-start flex-shrink-0 w-[260px] sm:w-[300px] group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-white border border-gray-200 group-hover:border-brand-orange transition-all group-hover:shadow-xl">
                {i < 3 && (
                  <span className="absolute top-3 left-3 z-10 bg-brand-orange text-brand-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    TOP #{i + 1}
                  </span>
                )}
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="mt-4 px-1">
                <h3 className="text-brand-black font-bold text-base line-clamp-2 group-hover:text-brand-orange transition-colors">
                  {product.title}
                </h3>
                <span className="block mt-1 text-brand-black font-extrabold text-lg">
                  {formatToCOP(product.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
