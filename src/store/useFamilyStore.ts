import { create } from 'zustand';

interface FamilySummary {
  _id: string;
  name: string;
 // slug?: string;
}

interface FamilyState {
  activeFamilyId: string | null;
  activeChildId: string | null;
  families: FamilySummary[];
  setFamilies: (families: FamilySummary[]) => void;
  setActiveFamilyId: (id: string | null) => void;
  setActiveChildId: (id: string | null) => void;
  clearStore: () => void;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  activeFamilyId: null,
  activeChildId: null,
  families: [],

  setFamilies: (families: FamilySummary[]) => set({ families }),

  setActiveFamilyId: (id: string | null) => set({ activeFamilyId: id }),
  
  setActiveChildId: (id: string | null) => set({ activeChildId: id }),

  clearStore: () => set({ 
    activeFamilyId: null, 
    activeChildId: null, 
    families: [] 
  }),
}));