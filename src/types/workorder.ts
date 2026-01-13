export interface IWorkOrder {
   _id?: string;
   workOrderId?: string;
   vehicleId: string;
   serviceType: string;
   notes?: string;
   mileage?: number;
   location: string[];
   serviceDueDate?: string | null;
   serviceDueKM: number | null;
   status: 'open' | 'completed';
   completedBy?: string;
   name?: string;
   type?: string;
   year?: string;
   isRecurring: boolean;
   serviceFrequencyKM?: number | null;
   serviceFrequencyWeeks?: number | null;
}

// Payload shape for creating a new work order
export type IWorkOrderInput = Omit<
  IWorkOrder,
  "_id" | "createdAt" | "updatedAt"
>;
