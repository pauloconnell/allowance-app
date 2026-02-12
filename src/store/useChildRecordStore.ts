import { create } from 'zustand';
import { normalizeRecord } from '@/lib/utils/normalizeRecord'; // Keeping logic consistent with backend
import type { IDailyRecord } from '@/types/IDailyRecord';

interface IChoreSnapshot {    // todo replace this with IDailyChore
  choreId: string;
  taskName: string;
  rewardAmount: number;
  completionStatus: 0 | 0.5 | 1.0;
}

interface TodayRecordState {
  todaysRecordId: string | null;
  records: IDailyRecord[]; 
  familyId: string | null;
  childId: string | null;
  todaysChoresList: IChoreSnapshot[]; // replace with IDailyChore
  isSubmitted: boolean;
  isApproved: boolean;
  isLoading: boolean;

  // Actions

  setTodaysRecord: (record: IDailyRecord) => void;
  setAllRecords: (records: IDailyRecord[]) => void;
  setFamilyId: (familyId: string) => void;
  setChildId: (childId: string) => void;
  updateChoreStatus: (choreIndex: number, status: 0 | 0.5 | 1.0) => Promise<void>;
  // done in API createTodaysRecord: (childId: string, familyId: string) => Promise<void>;
  submitRecord: () => Promise<void>;  // submits todays record


  fetchRecords: (id: string) => Promise<void>;
  clearRecords: () => void; // clear records when switching children
}

export const useChildRecordStore = create<TodayRecordState>((set, get) => ({
  todaysRecordId: null,
  records: [],
  familyId: null,
  childId: null,
  todaysChoresList: [],
  isSubmitted: false,
  isApproved: false,
  isLoading: false,


  setTodaysRecord: (record: IDailyRecord) => {  // called below when setting all records-individual chores wil be updated below
    set({
      todaysRecordId: record._id,
      familyId: record.familyId,
      childId: record.childId,
      todaysChoresList: record.choresList.map((chore) => ({
        choreId: chore.choreId,
        taskName: chore.taskName,
        rewardAmount: chore.rewardAmount,
        completionStatus: chore.completionStatus,
      })),
      isSubmitted: record.isSubmitted,
      isApproved: record.isApproved,
    });
  },

  setAllRecords: (records: IDailyRecord[]) => {
    const { setTodaysRecord } = get();
    set({ records });
    if (records.length > 0) {
    setTodaysRecord(records[0]); // assuming first is today's - must ensure db returns reverse date order
    }
  },

  setFamilyId: (familyId: string) =>
    set({ familyId }),
  
  setChildId: (childId: string) =>
    set({ childId }),

  
  fetchRecords: async (id: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/daily-records/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({
       // recordId: data.id,
        familyId: data.familyId,
        todaysChoresList: data.choresList,
        isSubmitted: data.isSubmitted,
        isApproved: data.isApproved,
        isLoading: false,
      });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
      throw new Error('Failed to fetch');
    }
  },

  //setTodaysRecord: 

  updateChoreStatus: async (choreIndex: number, completionStatus: 0 | 0.5 | 1.0) => {
    const { todaysRecordId } = get();
    if (!todaysRecordId) throw new Error("No record ID available for updating chore status");

    try {
      const res = await fetch(`/api/daily-records/${todaysRecordId}`, {
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
      set({ todaysChoresList: updated.choresList });
    } catch (err) {
      console.error('Chore update error:', err);
      throw new Error("Failed to update chore status");
    }
  },

  submitRecord: async () => { // this will likely not be done here -> moved to API
    const { todaysRecordId } = get();
    if (!todaysRecordId) throw new Error("No record ID available for submitting chore");;

    try {
      const res = await fetch(`/api/daily-records/${todaysRecordId}`, {
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

  clearRecords: () => set({ todaysRecordId: null, todaysChoresList: [], isSubmitted: false }),
}));