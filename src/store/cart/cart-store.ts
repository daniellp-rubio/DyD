import { create } from "zustand";
import { CartProduct } from "@/interfaces";

// Interface
import { persist } from "zustand/middleware";

interface State {
  cart: CartProduct[];

  getTotalItems: () => number;
  getSummaryInformation: () => {
    subTotal: number;
    total: number;
    itemsInCart: number;
  };

  addProductToCart: (product: CartProduct) => void;
  updateProductQuantity: (product: CartProduct, quantity: number ) => void;
  deleteProduct: (product: CartProduct) => void;

  clearCart: () => void;
};

export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      cart: [],

      getTotalItems: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },

      getSummaryInformation: () => {
        const { cart } = get();

        const subTotal = cart.reduce((subtotal, product) => (product.quantity * product.price) + subtotal ,0);
        const total = subTotal ;
        const itemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

        return {
          subTotal,
          total,
          itemsInCart
        };
      },

      addProductToCart: (product: CartProduct) => {
        const { cart } = get();

        const productInCart = cart.some(
          (item) => item.id === product.id
        );

        if (!productInCart) {
          set({ cart: [...cart, product] });
          return;
        };

        const updatedCartProducts = cart.map((item) => {
          if (item.id === product.id) {
            return {...item, quantity: item.quantity + product.quantity}
          };

          return item;
        });

        set({ cart: updatedCartProducts });
      },

      updateProductQuantity: (product: CartProduct, quantity: number) => {
        const { cart } = get();

        const updatedCartProducts = cart.map((item) => (
          item.id === product.id
            ? {
                ...item,
                quantity: quantity
              }
            : item
        ));

        set({ cart: updatedCartProducts });
      },

      deleteProduct(product: CartProduct) {
        const { cart } = get();

        const updatedCartProducts = cart.filter((item) => item.id !== product.id);

        set({ cart: updatedCartProducts });
      },

      clearCart: () => {
        set({ cart: [] })
      },
    }),
    {
      name: "shopping-cart",
    }
  )
);
