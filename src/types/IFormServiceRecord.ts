export interface IFormServiceRecord {       // react input forms will always be all strings -> mongoDB will convert this input into correct types based on schema
  serviceDate: string; // yyyy-mm-dd

  workOrderId: string;

  serviceDueDate: string; // yyyy-mm-dd or ''
  serviceDueKM: string;

  isRecurring: boolean;
  serviceFrequencyKM: string;
  serviceFrequencyWeeks: string;

  notes: string;
  completedBy: string;
  location: string[];
}
