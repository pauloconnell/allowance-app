import { connectDB } from './mongodb';
import ServiceRecord from '@/models/ServiceRecord';
import type { IWorkOrder } from '@/types/workorder';
import type { IVehicle } from '@/types/vehicle';
import { IServiceRecord } from "@/types/IServiceRecord"

// helper to normalize Records
export function normalizeServiceRecord(record: Partial<IServiceRecord>): Partial<IServiceRecord> {
   return {
      ...record,
      _id: record._id ? record._id.toString() : undefined,
      vehicleId: record.vehicleId ? record.vehicleId.toString() : undefined,
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : undefined,
      updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : undefined,
   };
}

export async function createServiceRecord(data: Partial<IServiceRecord>) {
   await connectDB();
   const record = await ServiceRecord.create(data);

   return normalizeServiceRecord(record.toObject());
}

export async function getServiceHistory(vehicleId: Partial<IVehicle>) {
   await connectDB();
   const records = await ServiceRecord.find({ vehicleId }).sort({ date: -1 }).lean();

   return records.map(normalizeServiceRecord);
}

export async function getAllServiceRecords(): Promise<IServiceRecord[]> {
   await connectDB();
   const records = await ServiceRecord.find().lean();

   return records.map(normalizeServiceRecord);
}
