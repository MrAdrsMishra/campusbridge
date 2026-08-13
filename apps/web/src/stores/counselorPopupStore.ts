import { create } from "zustand";

type CounselorPopupState = {
  isOpen: boolean;
  collegeName: string | null;
  open: (collegeName?: string) => void;
  close: () => void;
};

export const useCounselorPopupStore = create<CounselorPopupState>((set) => ({
  isOpen: false,
  collegeName: null,
  open: (collegeName) => set({ isOpen: true, collegeName: collegeName ?? null }),
  close: () => set({ isOpen: false, collegeName: null }),
}));
