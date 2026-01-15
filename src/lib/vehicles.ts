import { connectDB } from "./mongodb";
import Vehicle from "@/models/Vehicle";
import type { VehicleCreateInput } from "@/types/IVehicle";
import mongoose from "mongoose";



export async function getVehicleById(vehicleId: string) {
  await connectDB();

  // Security: ensure validId sent
  if (!mongoose.isValidObjectId(vehicleId)) {
  return null; // or throw an error
}


  const vehicle = await Vehicle.findOne({
    $or: [{ vehicleId }, { _id: vehicleId }],
  }).lean();

  if (!vehicle) return null;

  return {
    ...vehicle,
    _id: vehicle._id.toString(),
    vehicleId: vehicle.vehicleId?.toString() ?? vehicle._id.toString(),
    createdAt: vehicle.createdAt?.toISOString() ?? null,
    updatedAt: vehicle.updatedAt?.toISOString() ?? null,
  };
}

export async function getAllVehicles() {
  await connectDB();

  const vehicles = await Vehicle.find().lean();

  return vehicles.map((v) => ({
    ...v,
    _id: v._id.toString(),
    vehicleId: v.vehicleId?.toString() ?? v._id.toString(),
    createdAt: v.createdAt?.toISOString() ?? null,
    updatedAt: v.updatedAt?.toISOString() ?? null,
  }));
}

export async function createVehicle<T>(data: Partial<T>): Promise<T> {
  await connectDB();

  const v = await Vehicle.create(data);

  // Ensure vehicleId is set
  if (!v.vehicleId) {
    v.vehicleId = v._id.toString();
    await v.save();
  }

  return {
    ...v.toObject(),
    _id: v._id.toString(),
    vehicleId: v.vehicleId.toString(),
    createdAt: v.createdAt?.toISOString?.() ?? null,
    updatedAt: v.updatedAt?.toISOString?.() ?? null,
  };
}
