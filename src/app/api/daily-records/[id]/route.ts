import { NextResponse, NextRequest } from 'next/server';
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
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id } = await params;
      const dailyRecord = await DailyRecord.findById(id);
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
 * PUT /api/daily-records/[id]
 * Updates a chore or submits the daily record
 * Body: { action: 'updateChore' | 'submit', choreIndex?, completionStatus?, ... }
 */
export async function PUT(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { action } = body;
      const { id } = await params;

      const dailyRecord = await DailyRecord.findById(id);
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
            id,
            choreIndex,
            completionStatus
         );
      } else if (action === 'submit') {
         updatedRecord = await submitDailyRecord(id);
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
