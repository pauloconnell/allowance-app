import { NextResponse } from 'next/server';
import {
   getOrCreateTodaysDailyRecord,
   getChildDailyRecords,
   updateChoreCompletion,
   submitDailyRecord,
   upsertPenalty,
} from '@/lib/data/dailyRecordService';
import { getAuthSession } from '@/lib/auth/auth';
import { hasPermission } from '@/lib/auth/rbac';
import { normalizeRecord } from '@/lib/utils/normalizeRecord';

/**
 * GET /api/daily-records
 * Retrieves daily records for a child
 * Query params: childId, familyId, startDate?, endDate?
 */
export async function GET(request: Request) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const childId = searchParams.get('childId');
      const familyId = searchParams.get('familyId');
      const startDateStr = searchParams.get('startDate');
      const endDateStr = searchParams.get('endDate');

      if (!childId || !familyId) {
         return NextResponse.json(
            { error: 'childId and familyId are required' },
            { status: 400 }
         );
      }

      // RBAC: Check read permission on family
      const canRead = await hasPermission(session.userId, familyId, 'daily-record', 'read');
      if (!canRead) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const startDate = startDateStr ? startDateStr : new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().substring(0, 10);
      const endDate = endDateStr ? endDateStr : new Date().toISOString().substring(0, 10);

      const records = await getChildDailyRecords(childId, familyId, startDate, endDate);
      const normalized = records.map((r) => normalizeRecord(r));

      return NextResponse.json(normalized);
   } catch (err) {
      console.error('GET /api/daily-records error:', err);
      return NextResponse.json(
         { error: 'Failed to fetch daily records' },
         { status: 500 }
      );
   }
}

/**
 * POST /api/daily-records
 * Creates  daily record for a child, or creates standalone penalty
 * Body: { childId, familyId, date?, penalty? }
 */
export async function POST(request: Request) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { childId, familyId, date, penalty } = body;

      if (!childId || !familyId) {
         return NextResponse.json(
            { error: 'childId and familyId are required' },
            { status: 400 }
         );
      }

      // RBAC: Check appropriate permission
      const permission = penalty ? 'approve' : 'read';
      const canPerform = await hasPermission(session.userId, familyId, 'daily-record', permission);
      if (!canPerform) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Handle penalty upsert
      if (penalty) {
         console.log("Penalty should have date ", penalty)
         penalty.appliedBy=session.userId;
         const dailyRecord = await upsertPenalty(childId, familyId, penalty, date);
         const normalized = normalizeRecord(dailyRecord);
         return NextResponse.json(normalized, { status: 200 });
      }


      // using server functions to create records, don't need this api

      // // Handle regular daily record creation/retrieval
      // //const targetDate = date ? new Date(date) : new Date();
      // const dailyRecord = await getOrCreateTodaysDailyRecord(childId, familyId);
      // const normalized = normalizeRecord(dailyRecord);

      // return NextResponse.json(normalized, { status: 200 });
   } catch (err) {
      console.error('POST /api/daily-records error:', err);
      return NextResponse.json(
         { error: 'Failed to create/retrieve daily record' },
         { status: 500 }
      );
   }
}
