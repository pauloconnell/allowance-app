// Frontend form base type for creation/editing
// All fields are strings because HTML inputs return strings
export interface IFormBaseService {
    _id?: string;                // DB version: string (required after creation)
    companyId: string;
    vehicleId?: string;           // DB version: has this, but form may not yet
    nickName?: string;
    serviceType: string;         // DB version: string

    mileage?: string;            // DB version: number
    location: string[];         // DB version: string[]
    notes?: string;              // DB version: string

    completedBy?: string;        // DB version: string

    // Recurrence fields shared across forms 
    isRecurring: boolean; // DB: boolean 
    serviceFrequencyKM?: string; // DB: number | null 
    serviceFrequencyWeeks?: string; // DB: number | null

    
}
