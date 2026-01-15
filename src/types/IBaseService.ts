export interface IBaseService {
  _id: string;
  vehicleId: string;
  serviceType: string;
  mileage?: number;
  location?: string[];
  notes?: string;
  completedBy?: string;
}
