export interface IVehicle {
   _id: string;
   companyId: string;
   vehicleId?: string;
   nickName: string;
   make: string;
   model: string;
   mileage: string;
   year: string;
   vin?: string;
   createdAt?: string;
   updatedAt?: string;
}
