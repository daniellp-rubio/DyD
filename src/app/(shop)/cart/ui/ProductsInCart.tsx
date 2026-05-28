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

  useEffect(() => {
    setLoaded(true);
  }, [])

  if (!loaded) {
    return <p className="text-sm text-brand-smoke">Cargando carrito…</p>;
  };

  return (
    <div className="flex flex-col">
      {productsInCart.map(product => (
        <div
          className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0"
          key={`${product.slug}-${product.title}`}
        >
          <Link href={`/product/${product.slug}`} className="shrink-0">
            <Image
              src={product.image}
              width={96}
              height={96}
              style={{ width: "96px", height: "96px" }}
              alt={product.title}
              className="rounded-lg object-cover border border-gray-200"
            />
          </Link>

          <div className="flex flex-1 flex-col">
            <Link
              href={`/product/${product.slug}`}
              className="font-medium text-brand-black leading-snug hover:text-brand-orange transition-colors"
            >
              {product.title}
            </Link>
            <p className="text-lg font-bold text-brand-black mt-1">
              {formatToCOP(product.price)}
            </p>

            <div className="mt-auto flex items-center justify-between pt-3">
              <QuantitySelector
                quantity={product.quantity}
                onQuantityChanged={(value) => updateProductQuantity(product, value)}
                maxQuantity={product.inStock}
              />
              <button
                className="text-sm text-brand-smoke hover:text-red-500 transition-colors cursor-pointer"
                onClick={() => deleteProduct(product)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsInCart;