import { NextResponse, NextRequest } from 'next/server';
import {
   getOrCreateTodaysDailyRecord,
   getChildDailyRecords,
   updateChoreCompletion,
   submitDailyRecord,
} from '@/lib/dailyRecords';
import { getAuthSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { normalizeRecord } from '@/lib/normalizeRecord';

/**
 * GET /api/daily-records
 * Retrieves daily records for a child
 * Query params: childId, familyId, startDate?, endDate?
 */
export async function GET(req: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(req.url);
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

      const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = endDateStr ? new Date(endDateStr) : new Date();

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
 * Creates or retrieves today's daily record for a child
 * Body: { childId, familyId }
 */
export async function POST(req: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { childId, familyId } = body;

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

      const dailyRecord = await getOrCreateTodaysDailyRecord(childId, familyId);
      const normalized = normalizeRecord(dailyRecord);

      return NextResponse.json(normalized, { status: 200 });
   } catch (err) {
      console.error('POST /api/daily-records error:', err);
      return NextResponse.json(
         { error: 'Failed to create/retrieve daily record' },
         { status: 500 }
      );
   }
}
