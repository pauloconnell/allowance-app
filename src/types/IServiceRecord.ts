
import { IBaseService } from '@/types/IBaseService'


export interface IServiceRecord extends IBaseService {
    serviceDate:  string;// required

    // Track originating work order
    workOrderId?: string;

    // Work order scheduling info preserved for history
    serviceDueDate?:  string;
    serviceDueKM?: string;

    

    // Timestamps (ISO strings on the client, Date objects on the server) 
    createdAt: string;
    updatedAt: string
}
