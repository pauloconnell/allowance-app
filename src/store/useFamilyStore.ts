import { create } from 'zustand';

interface FamilySummary {
  _id: string;
  name: string;
  slug?: string;
}

interface useFamilyState {
  activeFamilyId: string | null;
  families: FamilySummary[];
  setFamilies: (families: FamilySummary[]) => void;
  setActiveFamilyId: (id: string | null) => void;
  clearFamily: () => void;
}

export const useFamilyStore = create<useFamilyState>((set) => ({
  activeFamilyId: null,
  families: [],

  setFamilies: (families: FamilySummary[]) => set({ families }),

  setActiveFamilyId: (id: string | null) => set({ activeFamilyId: id }),

  clearFamily: () => set({ activeFamilyId: null }),
}));

// Backward compatibility alias
export const useFamilyStore;