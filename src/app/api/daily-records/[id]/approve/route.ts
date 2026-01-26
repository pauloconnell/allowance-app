import { NextResponse, NextRequest } from 'next/server';
import { approveDailyRecord } from '@/lib/dailyRecords';
import { getAuthSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { normalizeRecord } from '@/lib/normalizeRecord';
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
   req: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { choreAdjustments = [], penalties = [] } = body;

      const dailyRecord = await DailyRecord.findById(params.id);
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
         params.id,
         session.userId,
         choreAdjustments,
         penalties
      );

      const updatedRecord = await DailyRecord.findById(params.id);
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
