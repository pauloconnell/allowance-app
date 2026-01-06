import { connectDB } from "./mongodb";
import Vehicle from "@/models/Vehicle";
import ServiceRecord from "@/models/ServiceRecord";

export async function getVehicleById(id: string) {
    await connectDB();
    return Vehicle.findById(id).lean();
}

export async function getAllVehicles() {
   await connectDB();
   const vehicles = await Vehicle.find().lean();
   return vehicles.map((v) => ({ 
    ...v, 
    _id: v._id.toString(),
    createdAt: v.createdAt?.toISOString?.() ?? null, 
    updatedAt: v.updatedAt?.toISOString?.() ?? null,

 }));
}

export async function getServiceHistory(vehicleId: string) {
    await connectDB();
    return ServiceRecord.find({ vehicleId }).sort({ date: -1 }).lean();
}

export async function createServiceRecord(data: any) {
    await connectDB();
    const record = await ServiceRecord.create(data);
    return record.toObject();
}
export async function createVehicle(data: any) {
    await connectDB();
    const vehicle = await Vehicle.create(data);
    return vehicle.toObject();
}

