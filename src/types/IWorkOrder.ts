import { IBaseService } from '@/types/IBaseService';

export interface IWorkOrder extends IBaseService {
   nickName: string;
   year?: string;
   type?: string;
   companyId: string;
   status: 'open' | 'completed';
   previousWorkOrderId?: string;
   serviceDate: string;
   serviceDueDate?: string;
   serviceDueKM?: string;

   createdAt?: string;
   updatedAt?: string;

   completedDate?: string;


}

// Payload shape for creating a new work order
export type IWorkOrderInput = Omit<IWorkOrder, '_id' | 'createdAt' | 'updatedAt'>;

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
