import { create } from 'zustand';
import { normalizeRecord } from '@/lib/SharedFE-BE-Utils/normalizeRecord'; // Keeping logic consistent with backend

interface IChoreSnapshot {
  choreId: string;
  taskName: string;
  rewardAmount: number;
  completionStatus: 0 | 0.5 | 1.0;
}

interface TodayRecordState {
  recordId: string | null;
  familyId: string | null;
  choresList: IChoreSnapshot[];
  isSubmitted: boolean;
  isApproved: boolean;
  isLoading: boolean;

  // Actions
  fetchRecord: (id: string) => Promise<void>;
  updateChoreStatus: (choreIndex: number, status: 0 | 0.5 | 1.0) => Promise<void>;
  submitRecord: () => Promise<void>;
  clearRecord: () => void;
}

export const useTodayRecordStore = create<TodayRecordState>((set, get) => ({
  recordId: null,
  familyId: null,
  choresList: [],
  isSubmitted: false,
  isApproved: false,
  isLoading: false,

  fetchRecord: async (id: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/daily-records/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({
        recordId: data.id,
        familyId: data.familyId,
        choresList: data.choresList,
        isSubmitted: data.isSubmitted,
        isApproved: data.isApproved,
        isLoading: false,
      });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  updateChoreStatus: async (choreIndex: number, completionStatus: 0 | 0.5 | 1.0) => {
    const { recordId } = get();
    if (!recordId) return;

    try {
      const res = await fetch(`/api/daily-records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateChore',
          choreIndex,
          completionStatus,
        }),
      });

      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      
      // Update local state with normalized response
      set({ choresList: updated.choresList });
    } catch (err) {
      console.error('Chore update error:', err);
    }
  },

  submitRecord: async () => {
    const { recordId } = get();
    if (!recordId) return;

    try {
      const res = await fetch(`/api/daily-records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' }),
      });

      if (!res.ok) throw new Error('Submission failed');
      const updated = await res.json();
      set({ isSubmitted: updated.isSubmitted });
    } catch (err) {
      console.error('Submit error:', err);
    }
  },

  clearRecord: () => set({ recordId: null, choresList: [], isSubmitted: false }),
}));