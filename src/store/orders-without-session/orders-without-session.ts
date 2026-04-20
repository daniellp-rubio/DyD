import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  address: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    address2?: string;
    postalCode: string;
    city: string;
    phone: string;
  }

  setAddress: (address: State['address']) => void;
};

export const useAddressWithoutSessionStore = create<State>()(
  persist(
    (set) => ({
      address: {
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        address2: "",
        postalCode: "",
        city: "",
        phone: ""
      },

      setAddress: (address) => {
        set({ address });
      },
    }),
    {
      name: "orders",
    }
  )
);