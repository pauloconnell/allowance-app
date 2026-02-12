import { NextResponse } from 'next/server';
import {
   updateChoreCompletion,
   submitDailyRecord,
   approveDailyRecord,
} from '@/lib/data/dailyRecordService';
import { getAuthSession } from '@/lib/auth/auth';
import { hasPermission } from '@/lib/auth/rbac';
import { normalizeRecord } from '@/lib/utils/normalizeRecord';
import DailyRecord from '@/models/DailyRecord';
import Child from '@/models/Child';

/**
 * GET /api/daily-records/[id]
 * Retrieves a specific daily record
 */
export async function GET(
   request: Request,
   context: { params: Promise<{ recordId: string }> }
) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { recordId } = await context.params;
      const dailyRecord = await DailyRecord.findById(recordId);
      if (!dailyRecord) {
         return NextResponse.json({ error: 'Daily record not found' }, { status: 404 });
      }

      // RBAC: Check read permission on family
      const canRead = await hasPermission(
         session.userId,
         dailyRecord.familyId.toString(),
         'daily-record',
         'read'
      );
      if (!canRead) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }


      

      const normalized = normalizeRecord(dailyRecord.toObject());
      return NextResponse.json(normalized);
   } catch (err) {
      console.error('GET /api/daily-records/[id] error:', err);
      return NextResponse.json(
         { error: 'Failed to fetch daily record' },
         { status: 500 }
      );
   }
}

/**
 * PUT /api/daily-records/[id]                                                            // actually - submit usually occurs on server automaticaly when current record date<today's date
 * Updates a chore or submits the daily record
 * Body: { action: 'updateChore' | 'submit', choreIndex?, completionStatus?, ... }
 */
export async function PUT(
   request: Request,
   context: { params: Promise<{ recordId: string }> }
) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { action } = body;
      const { recordId } = await context.params;

      const dailyRecord = await DailyRecord.findById(recordId);
      if (!dailyRecord) {
         return NextResponse.json({ error: 'Daily record not found' }, { status: 404 });
      }

      // RBAC: Check write permission on family
      const canWrite = await hasPermission(
         session.userId,
         dailyRecord.familyId.toString(),
         'daily-record',
         'update'
      );
      if (!canWrite) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      let updatedRecord;

      if (action === 'updateChore') {
         const { choreIndex, completionStatus } = body;
         updatedRecord = await updateChoreCompletion(
            recordId,
            choreIndex,
            completionStatus
         );
      } else if (action === 'submit') {
         updatedRecord = await submitDailyRecord(recordId);
      } else {
         return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      const normalized = normalizeRecord(updatedRecord);
      return NextResponse.json(normalized);
   } catch (err: any) {
      console.error('PUT /api/daily-records/[id] error:', err);
      return NextResponse.json(
         { error: err.message || 'Failed to update daily record' },
         { status: 500 }
      );
   }
}
