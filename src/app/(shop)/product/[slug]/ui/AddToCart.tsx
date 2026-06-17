"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoCartOutline, IoCheckmarkCircle } from "react-icons/io5";

import { QuantitySelector } from "@/components";
import { getStockBySlug } from "@/actions";
import { CartProduct, Product } from "@/interfaces";
import { useCartStore } from "@/store";
import { formatToCOP } from "@/utils";
import { trackMeta } from "@/lib/fbpixel";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface Props {
  product: Product;
}

const AddToCart = ({ product }: Props) => {
  const addProductToCart = useCartStore(state => state.addProductToCart);
  const router = useRouter();

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

  const effectivePrice = product.priceInOffer > 0 ? product.priceInOffer : product.price;
  const hasDiscount = product.priceInOffer > 0 && product.priceInOffer < product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.priceInOffer / product.price) * 100)
    : 0;
  const total = effectivePrice * quantity;

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
      price: effectivePrice,
      quantity,
      image: product.images[0],
      inStock: product.inStock,
      contentId: product.contentId,
    };
    addProductToCart(cartProduct);

    window.gtag?.("event", "add_to_cart", {
      currency: "COP",
      value: total,
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: effectivePrice,
          quantity,
        },
      ],
    });
    trackMeta("AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      contents: [{ id: product.id, quantity }],
      value: total,
      currency: "COP",
    });

    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    addToCart();
    router.push("/checkout/address");
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        {/* Precio tachado + descuento */}
        {hasDiscount && (
          <div className="flex items-center mb-3">
            <del className="text-brand-smoke text-sm line-through">{formatToCOP(product.price)}</del>
            <span className="text-brand-orange text-xs font-bold ml-2">
              -{discountPct}% OFF
            </span>
          </div>
        )}

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

        {/* Cuotas */}
        {effectivePrice >= 50000 && (
          <p className="text-xs text-brand-smoke mb-3">
            o{" "}
            <span className="font-bold text-brand-black">
              3 cuotas de {formatToCOP(Math.ceil(effectivePrice / 3))}
            </span>{" "}
            sin interés con Addi · Bancolombia · Nu
          </p>
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

        {/* Botón Comprar ahora */}
        {!isOutOfStock && !isLoading && (
          <button
            type="button"
            aria-label="Comprar ahora"
            className="border border-brand-black text-brand-black rounded-lg py-2 px-4 w-full my-1 hover:bg-brand-black hover:text-white transition-colors text-sm font-semibold"
            onClick={buyNow}
          >
            Comprar ahora
          </button>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-brand-smoke">
          <span>✓ Garantía 12 meses</span>
          <span>✓ Envío gratis +$150K</span>
          <span>✓ Devolución 30 días</span>
          <span>✓ Pago 100% seguro</span>
        </div>
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
        {!isOutOfStock && !isLoading && (
          <button
            type="button"
            aria-label="Comprar ya"
            className="border border-brand-black text-brand-black rounded-lg py-2.5 px-3 flex items-center justify-center text-sm font-semibold hover:bg-brand-black hover:text-white transition-colors whitespace-nowrap"
            onClick={buyNow}
          >
            Comprar ya
          </button>
        )}
      </div>
      <div className="md:hidden h-20" aria-hidden="true" />
    </>
  );
};

export default AddToCart;
