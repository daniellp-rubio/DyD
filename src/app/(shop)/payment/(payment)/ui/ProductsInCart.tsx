"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Utils
import { formatToCOP } from "@/utils";

// Store
import { useCartStore } from "@/store";

function ProductsInCart() {
  const [loaded, setLoaded] = useState(false);

  const productsInCart = useCartStore(state => state.cart);

  useEffect(() => {
    setLoaded(true);
  }, [])

  if (!loaded) {
    return <p>Loading...</p>
  };

  return (
    <>
    {
      productsInCart.map(product => (
        <div
          className="flex mb-5"
          key={`${product.slug}-${product.title}`}
        >
          <Image
            src={product.image}
            width={100}
            height={100}
            style={{
              width: "100px",
              height: "100px"
            }}
            alt={product.title}
            className="mr-5 rounded"
          />

          <div>
            <span>
            <p>{product.title} ({product.quantity})</p>
            </span>
            <p className="font-bold">{formatToCOP(product.price * product.quantity)}</p>
          </div>
        </div>
        ))
      }
    </>
  );
};

export default ProductsInCart;