import { create } from 'zustand';
import type { IChild } from '@/types/IChild';
import { normalizeRecord } from '@/lib/SharedFE-BE-Utils/normalizeRecord';

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
  addChild: (newChild: IChild) => void;
  setChildren: (children: IChild[]) => void;
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
  addChild: (newChild: IChild) => set((state) => ({
    children: [...state.children, newChild]
  })),
  setFamilies: (families: FamilySummary[]) => set({ families }),
  setActiveFamilyId: (id: string | null) => set({ activeFamilyId: id }),
  setActiveChildId: (id: string | null) => set({ activeChildId: id }),

  setChildren: (children: IChild[]) => set({
    children,
    childrenLoading: false
  }),

  fetchChildren: async (familyId: string) => {
    // Optimization: Don't fetch if we already have them for this family
    if( get().children.length > 0 && get().activeFamilyId === familyId) return;


    set({ childrenLoading: true });

    try {
      const res = await fetch(`/api/children?familyId=${familyId}`);
      if (!res.ok) throw new Error("Fetch failed");
      let data = await res.json();
      data = normalizeRecord(data);
      set({ children: data, childrenLoading: false });
    } catch (error) {
      console.error("Failed to fetch children:", error);
      set({ childrenLoading: false });
      throw error;  // let UI trigger Toast for user
    }
  },

  clearStore: () => set({
    activeFamilyId: null,
    activeChildId: null,
    families: [],
    children: []
  }),
}));