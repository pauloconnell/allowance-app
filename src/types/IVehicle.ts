export interface IVehicle {
   _id: string;
   vehicleId: string;
   name: string;
   make: string;
   model: string;
   mileage: number;
   year: number;
   vin: string;

}

// delete this:
export type VehicleCreateInput = Omit<
  IVehicle,
  '_id' | 'vehicleId' | 'createdAt' | 'updatedAt'
>;
