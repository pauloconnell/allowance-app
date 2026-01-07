export interface IWorkOrder {
  _id: string;
  vehicleId: string;
  serviceType: string;
  notes?: string;
  mileage?: number;
  location?: string;
  serviceDueDate?: string | null;
}
