import { connectDB } from './mongodb';
import DailyRecord from '@/models/DailyRecord';
import type { IDailyRecord } from '@/types/IDailyRecord';
import type { IChild } from '@/types/IChild';

// Re-exported from dailyRecords.ts - this file kept for backward compatibility

// helper to normalize Daily Records
export function normalizeDailyRecord(record: IDailyRecord): IDailyRecord {
   return {
      ...record,
      _id: record._id.toString(),
      childId: record.childId.toString(),
      familyId: record.familyId.toString(),
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      createdAt: new Date(record.createdAt).toISOString(),
      updatedAt: new Date(record.updatedAt).toISOString(),
   };
}

export async function createDailyRecord(data: Partial<IDailyRecord>) {
   await connectDB();
   const record = await DailyRecord.create(data);

   return normalizeDailyRecord(record.toObject());
}

export async function getDailyHistory(
   childId: string,
   familyId?: string
): Promise<IDailyRecord[]> {
   await connectDB();
   const query: any = { childId };
   if (familyId) {
      query.familyId = familyId;
   }
   const records = await DailyRecord.find(query).sort({ date: -1 }).lean();

   return records.map(normalizeDailyRecord);
}

export async function getAllDailyRecords(familyId?: string): Promise<IDailyRecord[]> {
   await connectDB();
   const query = familyId ? { familyId } : {};
   const records = await DailyRecord.find(query).lean();

   return records.map(normalizeDailyRecord);
}

// Backward compatibility aliases - legacy function names
export const normalizeServiceRecord = normalizeDailyRecord;
export const createServiceRecord = createDailyRecord;
export const getServiceHistory = getDailyHistory;
export const getAllServiceRecords = getAllDailyRecords;
