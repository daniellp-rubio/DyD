"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

// Components
import { QuantitySelector } from "@/components";

// Utils
import { formatToCOP } from "@/utils";

// Store
import { useCartStore } from "@/store";

function ProductsInCart() {
  const [loaded, setLoaded] = useState(false);

  const productsInCart = useCartStore(state => state.cart);
  const updateProductQuantity = useCartStore(state => state.updateProductQuantity);
  const deleteProduct = useCartStore(state => state.deleteProduct);

  console.log("productsInCart", productsInCart);

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
            <Link
            className="hover:underline cursor-pointer"
              href={`/product/${product.slug}`}
            >
            <p>{product.title}</p>
            </Link>
            <p>{formatToCOP(product.price)}</p>

            <QuantitySelector
              quantity={product.quantity}
              onQuantityChanged={(value) => updateProductQuantity(product, value)}
              inStock={product.inStock}
            />

              <button
                className="hover:underline cursor-pointer mt-3"
                onClick={() => deleteProduct(product)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))
      }
    </>
  );
};

export default ProductsInCart;