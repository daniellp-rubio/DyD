'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Product } from "@/interfaces";
import { formatToCOP } from "@/utils";

interface Props {
  product: Product;
};

export const ProductGridItem = ({ product }: Props) => {
  const [displayImage, setDisplayImage] = useState(product.images[0]);
  const isLowStock = product.inStock > 0 && product.inStock <= 5;
  const isOutOfStock = product.inStock === 0;

  return (
    <div className="group rounded-2xl overflow-hidden fade-in bg-brand-white border border-gray-200 hover:border-brand-orange transition-all hover:shadow-xl hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden">
        {isLowStock && (
          <span className="absolute top-3 left-3 z-10 bg-brand-orange text-brand-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            ¡Últimas unidades!
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-3 left-3 z-10 bg-brand-smoke text-brand-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            Agotado
          </span>
        )}
        <Image
          src={displayImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          width={800}
          height={800}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onMouseEnter={() => product.images[1] && setDisplayImage(product.images[1])}
          onMouseLeave={() => setDisplayImage(product.images[0])}
        />
      </Link>

      <div className="p-4 flex flex-col gap-1">
        <Link
          className="text-brand-black font-semibold text-base line-clamp-2 hover:text-brand-orange transition-colors"
          href={`/product/${product.slug}`}
        >
          {product.title}
        </Link>
        <span className="text-brand-black font-extrabold text-lg mt-1">
          {formatToCOP(product.price)}
        </span>
      </div>
    </div>
  )
};
