import { create } from 'zustand';
import type { IChild } from '@/types/IChild'; // Ensure you rename your IVehicle.ts file to IChild.ts

interface ChildState {
  // Single child (detail view / current profile)
  selectedChild: IChild | null;
  setSelectedChild: (child: IChild) => void;
  clearSelectedChild: () => void;
  fetchChild: (id: string) => Promise<void>;

  // All children in the family (parent dashboard)
  allChildren: IChild[];
  setAllChildren: (children: IChild[]) => void;
  fetchAllChildren: (familyId: string) => Promise<void>;
}

export const useChildStore = create<ChildState>((set) => ({
  // --- Selected Child ---
  selectedChild: null,

  setSelectedChild: (child) => set({ selectedChild: child }),

  clearSelectedChild: () => set({ selectedChild: null }),

  fetchChild: async (id) => {
    try {
      const res = await fetch(`/api/children/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch child: ${res.status}`);
      const data = await res.json();
      set({ selectedChild: data });
    } catch (error) {
      console.error('Error fetching child:', error);
      set({ selectedChild: null });
    }
  },

  // --- All Children ---
  allChildren: [],

  setAllChildren: (children) => set({ allChildren: children }),

  fetchAllChildren: async (familyId) => {
    try {
      const res = await fetch(`/api/children?familyId=${familyId}`);
      if (!res.ok) throw new Error(`Failed to fetch children: ${res.status}`);
      const data = await res.json();
      set({ allChildren: data });
    } catch (error) {
      console.error('Error fetching children:', error);
      set({ allChildren: [] });
    }
  },
}));