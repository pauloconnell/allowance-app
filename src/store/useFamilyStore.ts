import { create } from 'zustand';
import type { IChild } from '@/types/IChild';

interface FamilySummary {
  _id: string;
  name: string;
}

interface FamilyState {
  activeFamilyId: string | null;
  activeChildId: string | null;
  families: FamilySummary[];
  // New State for Children
  children: IChild[];
  childrenLoading: boolean;
  
  setFamilies: (families: FamilySummary[]) => void;
  setActiveFamilyId: (id: string | null) => void;
  setActiveChildId: (id: string | null) => void;
  
  // New Actions for Children
  fetchChildren: (familyId: string) => Promise<void>;
  clearStore: () => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  activeFamilyId: null,
  activeChildId: null,
  families: [],
  children: [],
  childrenLoading: false,

  setFamilies: (families: FamilySummary[]) => set({ families }),
  setActiveFamilyId: (id: string | null) => set({ activeFamilyId: id }),
  setActiveChildId: (id: string | null) => set({ activeChildId: id }),

  fetchChildren: async (familyId: string) => {
    // Optimization: Don't fetch if we already have them for this family
    if (get().children.length > 0 && get().activeFamilyId === familyId) return;

    set({ childrenLoading: true });
    try {
      const res = await fetch(`/api/${familyId}/children`);
      const data = await res.json();
      set({ children: data, childrenLoading: false });
    } catch (error) {
      console.error("Failed to fetch children:", error);
      set({ childrenLoading: false });
    }
  },

  clearStore: () => set({ 
    activeFamilyId: null, 
    activeChildId: null, 
    families: [],
    children: [] 
  }),
}));