import { create } from "zustand";
import type { Lead } from "../types";

type DashboardStore = {
  leads: Lead[];
  activeLead: Lead | null;
  saving: boolean;
  setLeads: (leads: Lead[]) => void;
  setActiveLead: (lead: Lead | null) => void;
  setSaving: (saving: boolean) => void;
  replaceLead: (id: string, lead: Lead) => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  leads: [],
  activeLead: null,
  saving: false,
  setLeads: (leads) => set({ leads }),
  setActiveLead: (activeLead) => set({ activeLead }),
  setSaving: (saving) => set({ saving }),
  replaceLead: (id, lead) =>
    set((state) => ({
      leads: state.leads.map((item) => (item._id === id ? lead : item)),
    })),
}));