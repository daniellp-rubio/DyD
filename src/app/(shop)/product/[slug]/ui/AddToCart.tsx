"use client";

import { useEffect, useState } from "react";
import { IoCartOutline, IoCheckmarkCircle } from "react-icons/io5";

import { QuantitySelector } from "@/components";
import { getStockBySlug } from "@/actions";
import { CartProduct, Product } from "@/interfaces";
import { useCartStore } from "@/store";
import { formatToCOP } from "@/utils";

// Utils
import { fbq } from "@/utils/fbpixel";

interface Props {
  product: Product;
}

const AddToCart = ({ product }: Props) => {
  const addProductToCart = useCartStore(state => state.addProductToCart);

  const [quantity, setQuantity] = useState<number>(1);
  const [stock, setStock] = useState<number | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    getStockBySlug(product.slug).then(s => {
      if (active) setStock(s);
    });
    return () => { active = false; };
  }, [product.slug]);

  const isLoading = stock === null;
  const isOutOfStock = stock === 0;
  const maxReached = stock !== null && quantity >= stock;
  const total = product.price * quantity;

  const handleQuantityChanged = (q: number) => {
    if (stock === null) return setQuantity(q);
    setQuantity(Math.min(Math.max(1, q), stock));
  };

  const addToCart = () => {
    if (isOutOfStock || isLoading) return;
    const cartProduct: CartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      image: product.images[0],
      inStock: product.inStock,
      contentId: product.contentId,
    };
    addProductToCart(cartProduct);
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between my-4">
          <span className="text-sm text-brand-smoke">Cantidad</span>
          <QuantitySelector quantity={quantity} onQuantityChanged={handleQuantityChanged} />
        </div>

        {quantity > 1 && !isOutOfStock && (
          <p className="text-sm text-brand-smoke mb-2">
            Total: <span className="font-bold text-brand-black">{formatToCOP(total)}</span>
          </p>
        )}

        {maxReached && !isOutOfStock && (
          <p className="text-xs text-brand-orange mb-2">Has alcanzado el máximo disponible</p>
        )}

        <button
          type="button"
          aria-label={isOutOfStock ? "Producto agotado" : "Agregar al carrito"}
          disabled={isOutOfStock || isLoading}
          className={`${isOutOfStock || isLoading ? "btn-disabled" : "btn-primary"} w-full my-2 flex items-center justify-center gap-2`}
          onClick={addToCart}
        >
          {added ? (
            <>
              <IoCheckmarkCircle size={20} /> Agregado
            </>
          ) : isOutOfStock ? (
            "Agotado"
          ) : (
            <>
              <IoCartOutline size={20} /> Agregar al carrito
            </>
          )}
        </button>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <QuantitySelector
          quantity={quantity}
          onQuantityChanged={handleQuantityChanged}
          compact
        />
        <button
          type="button"
          aria-label={isOutOfStock ? "Producto agotado" : "Agregar al carrito"}
          disabled={isOutOfStock || isLoading}
          className={`${isOutOfStock || isLoading ? "btn-disabled" : "btn-primary"} flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm`}
          onClick={addToCart}
        >
          {added ? (
            <>
              <IoCheckmarkCircle size={18} /> Agregado
            </>
          ) : isOutOfStock ? (
            "Agotado"
          ) : (
            <>
              <IoCartOutline size={18} />
              <span className="truncate">Agregar</span>
            </>
          )}
        </button>
      </div>
      <div className="md:hidden h-20" aria-hidden="true" />
    </>
  );
};

export default AddToCart;
