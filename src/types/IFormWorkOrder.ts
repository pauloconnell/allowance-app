export interface IFormWorkOrder {  // react input forms will be all strings -> mongoDB will convert this input into correct types based on schema
  workOrderId: string;
  vehicleId: string;
  serviceType: string;

  serviceDate: string; // yyyy-mm-dd
  serviceDueDate: string; // yyyy-mm-dd or ''

  serviceDueKM: string;
  mileage: string;

  location: string[];
  notes: string;
  completedBy: string;

  isRecurring: boolean;
  serviceFrequencyKM: string;
  serviceFrequencyWeeks: string;
}
