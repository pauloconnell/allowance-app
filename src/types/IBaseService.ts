export interface IBaseService {
   _id: string; // Form version: string (optional during creation)
   familyId: string;
   vehicleId: string;
   nickName: string;
   serviceType: string;

   mileage: string; // Form version: string (input) → number (DB)
   location?: string[];
   notes?: string;
   completedBy: string;

   // Recurrence fields
   isRecurring: boolean;
   serviceFrequencyKM?: string ;
   serviceFrequencyWeeks?: string;
}
