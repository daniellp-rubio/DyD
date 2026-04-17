import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  show: boolean;

  getNotification: () => void;
  openNotification: () => void;
  closeNotification: () => void;
};

export const useNotificationStore = create<State>()(
  persist(
    (set, get) => ({
      show: false,

      getNotification: () => {
        const { show } = get();
        return show;
      },

      openNotification: () => {
        set({ show: true });
      },

      closeNotification: () => {
        set({ show: false });
      },
    }),
    {
      name: "notification"
    }
  )
);
