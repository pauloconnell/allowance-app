
import { IBaseService } from '@/types/IBaseService'


export interface IServiceRecord extends IBaseService {
  serviceDate: string; // required

  // Track originating work order
  workOrderId?: string;

  // Work order scheduling info preserved for history
  serviceDueDate?: string | null;
  serviceDueKM?: number | null;

  // Recurrence info preserved for history
  isRecurring?: boolean;
  serviceFrequencyKM?: number | null;
  serviceFrequencyWeeks?: number | null;

  createdAt: string;
  updatedAt: string;
}
