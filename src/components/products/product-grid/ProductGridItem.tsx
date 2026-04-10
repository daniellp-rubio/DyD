'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Components
// import AddToCart from "./ui/add-to-cart";

// interface
import { Product } from "@/interfaces";

// Utils
import { formatToCOP } from "@/utils";

interface Props {
  product: Product;
};

export const ProductGridItem = ({ product }: Props) => {
  const [displayImage, setDisplayImage] = useState(product.images[0]);

  return (
    <div className="rounded-md overflow-hidden fade-in">
      <Link
        href={`/product/${product.slug}`}
      >
        <Image
          src={displayImage}
          alt={product.title}
          className="w-full overflow-hidden rounded h-120 object-cover"
          width={800}
          height={800}
          loading="lazy"
          // onMouseEnter={() => setDisplayImage(product.images[1])}
          onMouseLeave={() => setDisplayImage(product.images[0])}
        />
      </Link>

      <div className="p-4 flex flex-col">
        <Link
          href={`/product/${product.slug}`}
        >
          {product.title}
        </Link>
        <div>
          <span className="font-bold">{formatToCOP(product.price)}</span>
          <span className="font-bold">ㅤ</span>
          <span className="font-bold"><del>{formatToCOP(product.price + 30000)}</del></span>
        </div>

        {/* <AddToCart product={product}/> */}
      </div>
    </div>
  )
};
