"use client";

import { useState } from "react";

import { QuantitySelector } from "@/components";
import { CartProduct, Product } from "@/interfaces";
import { useCartStore } from "@/store";

interface Props {
  product: Product;
}

const AddToCart = ({ product }: Props) => {
  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const [quantity, setQuantity] = useState<number>(1);

  const addToCart = () => {
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
    setQuantity(1);
  };

  return (
    <>
      <QuantitySelector
        quantity={quantity}
        maxQuantity={product.inStock}
        onQuantityChanged={setQuantity}
      />
      <button className="btn-primary my-3" onClick={addToCart} disabled={product.inStock <= 0}>
        Agregar al carrito
      </button>
    </>
  );
};

export default AddToCart;
