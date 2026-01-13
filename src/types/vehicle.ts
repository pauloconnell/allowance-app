export interface IVehicle {
   _id: string;
   vehicleId: string;
   name: string;
   make: string;
   model: string;
   year: number;
   vin: string;

}


export type VehicleCreateInput = Omit<
  IVehicle,
  '_id' | 'vehicleId' | 'createdAt' | 'updatedAt'
>;
