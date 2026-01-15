import { IBaseService } from '@/types/IBaseService'

export interface IWorkOrder extends IBaseService {
  name: string;
  year?: string;
  type?: string;

  status: 'open' | 'completed';

  serviceDate?: string | null;
  serviceDueDate?: string | null;
  serviceDueKM?: number | null;

  completedDate?: string | null;

  isRecurring?: boolean;
  serviceFrequencyKM?: number | null;
  serviceFrequencyWeeks?: number | null;

  createdAt?: string;
  updatedAt?: string;
}


// Payload shape for creating a new work order
export type IWorkOrderInput = Omit<
  IWorkOrder,
  "_id" | "createdAt" | "updatedAt"
>;





// export interface IWorkOrder {
//    _id?: string;
//    workOrderId?: string;
//    vehicleId: string;
//    name: string;
//    year?: string;
//    serviceType: string;
//    notes?: string;
//    mileage?: number;
//    location: string[];
//    serviceDueDate?: string | null;
//    serviceDueKM?: number | null;
//    status: 'open' | 'completed';
//    completedBy?: string;
   
//    isRecurring: boolean;
//    serviceFrequencyKM?: number | null;
//    serviceFrequencyWeeks?: number | null;
// }

