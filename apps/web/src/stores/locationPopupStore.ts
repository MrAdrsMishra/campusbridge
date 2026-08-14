import { create } from "zustand";

type LocationPopupStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useLocationPopupStore =
  create<LocationPopupStore>((set) => ({
    isOpen: false,

    open: () => set({ isOpen: true }),

    close: () => set({ isOpen: false }),
  }));