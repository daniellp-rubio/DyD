import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  quantity: number;

  getQuantity: () => void;
  sumQuantity: () => void;
  restQuantity: () => void;
};

export const useQuantityStore = create<State>()(
  persist(
    (set, get) => ({
      quantity: 1,

      getQuantity: () => {
        const { quantity } = get();
        return quantity;
      },

      sumQuantity: () => {
        const { quantity } = get();
        set({ quantity: quantity + 1 >= 99 ? 99 : quantity + 1 });
      },

      restQuantity: () => {
        const { quantity } = get();
        set({ quantity: quantity - 1 >= 1 ? quantity - 1 : 1 });
      },
    }),
    {
      name: "quantity"
    }
  )
);
