import { create } from 'zustand';
import type { IWorkOrder } from '@/types/IWorkOrder';

interface WorkOrderState {
   workOrders: IWorkOrder[];
   selectedWorkOrder: IWorkOrder | null;
   // Setters
   setSelectedWorkOrder: (wo: IWorkOrder | null) => void;
   clearSelectedWorkOrder: () => void;
   // Fetchers
   fetchAllWorkOrders: () => Promise<void>;
   fetchWorkOrder: (id: string) => Promise<void>;
   // Derived selectors
   getWorkOrdersForVehicle: (vehicleId: string) => IWorkOrder[];
   getUpcomingWorkOrders: () => IWorkOrder[];
   updateWorkOrderInStore: (wo: IWorkOrder) => void;
}

export const useWorkOrderStore = create<WorkOrderState>((set, get) => ({
   workOrders: [],
   selectedWorkOrder: null,

   setSelectedWorkOrder: (wo) => set({ selectedWorkOrder: wo }),

   clearSelectedWorkOrder: () => set({ selectedWorkOrder: null }),

   fetchAllWorkOrders: async () => {
      try {
         const res = await fetch('/api/work-orders');
         if (!res.ok) {
            throw new Error(`Failed to fetch work order: ${res.statusText}`);
         }
         const data: IWorkOrder[] = await res.json();
         set({ workOrders: data });
      } catch (e) {
         console.error("error getting work orders:", e)
         set({ workOrders: [] });
      }

   },

   fetchWorkOrder: async (id) => {
      try {
         const res = await fetch(`/api/work-orders/${id}`);
         if (!res.ok) {
            throw new Error(`Failed to fetch work order: ${res.statusText}`);
         }
         const data: IWorkOrder = await res.json();
         set({ selectedWorkOrder: data });
      }
      catch (e) {
         console.error("error getting work order:", e);
         set({ selectedWorkOrder: null });
      }
   },

   getWorkOrdersForVehicle: (vehicleId) => {
      return get().workOrders.filter((wo) => wo.vehicleId === vehicleId);
   },

   // DB Actions

   getUpcomingWorkOrders: () => {
      const now = new Date();
      const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      return get().workOrders.filter((wo) => {
         const dueDate = wo.serviceDueDate ? new Date(wo.serviceDueDate) : null;
         const dueKM = wo.serviceDueKM;
         // Show if overdue OR due within next 2 weeks 
         // Only evaluate date logic if a dueDate exists 
         const isOverdue = dueDate ? dueDate < now : false;
         const isDueSoon = dueDate ? (dueDate >= now && dueDate <= twoWeeksFromNow) : false;
         const kmSoon = dueKM && wo.mileage && dueKM - wo.mileage <= 100;
         return isOverdue || isDueSoon || kmSoon;
      });
   },

   updateWorkOrderInStore: (updatedWO: IWorkOrder) =>
      set((state) => ({
         workOrders: state.workOrders.map((wo: IWorkOrder) =>
            wo._id === updatedWO._id ? updatedWO : wo
         ),
      })),
}));
