import { NextResponse } from 'next/server';
import { approveDailyRecord } from '@/lib/data/dailyRecordService';
import { getAuthSession } from '@/lib/auth/auth';
import { hasPermission } from '@/lib/auth/rbac';
import { normalizeRecord } from '@/lib/utils/normalizeRecord';
import DailyRecord from '@/models/DailyRecord';

/**
 * POST /api/daily-records/[id]/approve
 * Parent approves a daily record with adjustments and penalties
 * Body: {
 *   choreAdjustments: [{ choreIndex, parentAdjustedReward?, isOverridden }],
 *   penalties: [{ amount, reason }]
 * }
 */
export async function POST(
   request: Request,
   context: { params: Promise<{ recordId: string }> }
) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { choreAdjustments = [], penalties = [] } = body;
      const { recordId } = await context.params;

      const dailyRecord = await DailyRecord.findById(recordId);
      if (!dailyRecord) {
         return NextResponse.json({ error: 'Daily record not found' }, { status: 404 });
      }

      // RBAC: Check admin/parent permission on family
      const canApprove = await hasPermission(
         session.userId,
         dailyRecord.familyId.toString(),
         'daily-record',
         'approve'
      );
      if (!canApprove) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const payoutResult = await approveDailyRecord(
         recordId,
         session.userId,
         choreAdjustments
         
      );

      const updatedRecord = await DailyRecord.findById(recordId);
      const normalized = normalizeRecord(updatedRecord.toObject());

      return NextResponse.json({
         success: true,
         record: normalized,
         payout: payoutResult,
      });
   } catch (err: any) {
      console.error('POST /api/daily-records/[id]/approve error:', err);
      return NextResponse.json(
         { error: err.message || 'Failed to approve daily record' },
         { status: 500 }
      );
   }
}
