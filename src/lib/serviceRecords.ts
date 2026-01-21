import { connectDB } from './mongodb';
import ServiceRecord from '@/models/ServiceRecord';
import type { IWorkOrder } from '@/types/IWorkOrder';
import type { IVehicle } from '@/types/IVehicle';
import { IServiceRecord } from '@/types/IServiceRecord';

// helper to normalize Records
export function normalizeServiceRecord(record: IServiceRecord): IServiceRecord {
   return {
      ...record,
      _id: record._id.toString(),
      vehicleId: record.vehicleId.toString(),
      serviceDate: new Date(record.serviceDate).toISOString(),
      serviceDueDate: record.serviceDueDate
         ? new Date(record.serviceDueDate).toISOString()
         : null,
      createdAt: new Date(record.createdAt).toISOString(),
      updatedAt: new Date(record.updatedAt).toISOString(),
   };
}

export async function createServiceRecord(data: Partial<IServiceRecord>) {
   await connectDB();
   const record = await ServiceRecord.create(data);

   return normalizeServiceRecord(record.toObject());
}

export async function getServiceHistory(
   vehicleId: string
): Promise<IServiceRecord[]> {
   await connectDB();
   const records = await ServiceRecord.find({ vehicleId }).sort({ date: -1 }).lean();

   return records.map(normalizeServiceRecord);
}

export async function getAllServiceRecords(): Promise<IServiceRecord[]> {
   await connectDB();
   const records = await ServiceRecord.find().lean();

   return records.map(normalizeServiceRecord);
}
