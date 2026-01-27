import { create } from 'zustand';
import type { IChore } from '@/types/IChore';
import { useFamilyStore } from './useFamilyStore';

interface ChoreState {
   chores: IChore[];
   selectedChore: IChore | null;
   // Setters
   setSelectedChore: (chore: IChore | null) => void;
   clearSelectedChore: () => void;
   // Fetchers
   fetchAllChores: (familyId: string) => Promise<void>;
   fetchChore: (id: string) => Promise<void>;
   // Derived selectors
   getChoresForChild: (childId: string) => IChore[];
   getUpcomingChores: () => IChore[];
   updateChoreInStore: (chore: IChore) => void;
}

export const useChoreStore = create<ChoreState>((set, get) => ({
   chores: [],
   selectedChore: null,

   setSelectedChore: (chore) => set({ selectedChore: chore }),

   clearSelectedChore: () => set({ selectedChore: null }),

   fetchAllChores: async (familyId: string) => {
      if (!familyId) {
         console.warn("No active familyId provided, cannot fetch chores");
         return;
      } 

      try {
         const res = await fetch(`/api/chores?familyId=${familyId}`);
         if (!res.ok) throw new Error(`Failed to fetch chores: ${res.statusText}`);
         const data: IChore[] = await res.json();
         set({ chores: data });
      } catch (e) {
         console.error("Error getting chores:", e);
         set({ chores: [] });
      }
   },

   fetchChore: async (choreId: string) => {
      try {
         const familyId = useFamilyStore.getState().activeFamilyId;
         const res = await fetch(`/api/chores/${choreId}?familyId=${familyId}`);
         if (!res.ok) throw new Error(`Failed to fetch chore: ${res.statusText}`);
         const data: IChore = await res.json();
         set({ selectedChore: data });
      } catch (e) {
         console.error("Error getting chore:", e);
         set({ selectedChore: null });
      }
   },

   getChoresForChild: (childId) => {
      return get().chores.filter((chore) => chore.childId === childId);
   },

   getUpcomingChores: () => {
      const now = new Date();
      // Lookahead window (e.g., chores due today or tomorrow)
      const soonThreshold = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      return get().chores.filter((chore) => {
         if (!chore.dueDate) return false;
         const dueDate = new Date(chore.dueDate);
         
         const isOverdue = dueDate < now && chore.completionStatus < 1.0;
         const isDueSoon = dueDate >= now && dueDate <= soonThreshold;
         
         return isOverdue || isDueSoon;
      });
   },

   updateChoreInStore: (updatedChore: IChore) =>
      set((state) => ({
         chores: state.chores.map((chore) =>
            chore._id === updatedChore._id ? updatedChore : chore
         ),
      })),
}));