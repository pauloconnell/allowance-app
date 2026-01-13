import { connectDB } from './mongodb';
import ServiceRecord from '@/models/ServiceRecord';
import type { IWorkOrder } from '@/types/workorder';
import type { IVehicle } from '@/types/vehicle';

// helper to normalize Records
export function normalizeServiceRecord(record: any) {
   return {
      ...record,
      _id: record._id?.toString() ?? '',
      vehicleId: record.vehicleId?.toString() ?? '',
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : null,
      updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : null,
   };
}

export async function createServiceRecord(data: IWorkOrder) {
   await connectDB();
   const record = await ServiceRecord.create(data);

   return normalizeServiceRecord(record.toObject());
}

export async function getServiceHistory(vehicleId: IVehicle) {
   await connectDB();
   const records = await ServiceRecord.find({ vehicleId }).sort({ date: -1 }).lean();

   return records.map(normalizeServiceRecord);
}

export async function getAllServiceRecords(): Promise<IWorkOrder[]> {
   await connectDB();
   const records = await ServiceRecord.find().lean();

return records.map(normalizeServiceRecord);
}
