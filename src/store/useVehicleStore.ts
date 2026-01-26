import { create } from 'zustand';
import type { IVehicle } from '@/types/IVehicle';

interface ChildState {
  // Single child (detail view)
  selectedChild: IVehicle | null;
  setSelectedChild: (child: IVehicle) => void;
  clearSelectedChild: () => void;
  fetchChild: (id: string) => Promise<void>;

  // All children (dashboard, dropdowns, forms)
  allChildren: IVehicle[];
  setAllChildren: (children: IVehicle[]) => void;
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

// Backward compatibility aliases
export const useVehicleStore = useChildStore;
