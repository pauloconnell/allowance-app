import { create } from 'zustand';

interface CompanySummary {
  _id: string;
  name: string;
  slug?: string;
}

interface useCompanyState {
  activeCompanyId: string | null;
  companies: CompanySummary[];
  setCompanies: (companies: CompanySummary[]) => void;
  setActiveCompanyId: (id: string | null) => void;
  clearCompany: () => void;
}

export const useCompanyStore = create<useCompanyState>((set) => ({
  activeCompanyId: null,
  companies: [],

  setCompanies: (companies: CompanySummary[]) => set({ companies }),

  setActiveCompanyId: (id: string | null) => set({ activeCompanyId: id }),

  clearCompany: () => set({ activeCompanyId: null }),
}));