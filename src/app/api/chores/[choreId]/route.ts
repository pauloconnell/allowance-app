import { NextResponse, NextRequest } from 'next/server';
import Chore from '@/models/Chore';
import { getAuthSession } from '@/lib/auth/auth';
import { hasPermission } from '@/lib/auth/rbac';
import { normalizeRecord } from '@/lib/utils/normalizeRecord';
import type { IChoreFormData } from '@/types/IChore';

/**
 * GET /api/chores/[choreId]
 * Retrieves a specific chore
 */
export async function GET(
   req: NextRequest,
   { params }: { params: { choreId: string } }
) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const chore = await Chore.findById(params.choreId);
      if (!chore) {
         return NextResponse.json({ error: 'Chore not found' }, { status: 404 });
      }

      // RBAC: Check read permission
      const canRead = await hasPermission(
         session.userId,
         chore.familyId.toString(),
         'chore',
         'read'
      );
      if (!canRead) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const normalized = normalizeRecord(chore.toObject());
      return NextResponse.json(normalized);
   } catch (err) {
      console.error('GET /api/chores/[choreId] error:', err);
      return NextResponse.json(
         { error: 'Failed to fetch chore' },
         { status: 500 }
      );
   }
}

/**
 * PUT /api/chores/[choreId]
 * Updates a chore
 */
export async function PUT(
   req: NextRequest,
   { params }: { params: { choreId: string } }
) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const chore = await Chore.findById(params.choreId);
      if (!chore) {
         return NextResponse.json({ error: 'Chore not found' }, { status: 404 });
      }

      // RBAC: Check write permission
      const canWrite = await hasPermission(
         session.userId,
         chore.familyId.toString(),
         'chore',
         'write'
      );
      if (!canWrite) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = (await req.json()) as Partial<IChoreFormData>;

      // Only allow updating these fields
      if (body.taskName) chore.taskName = body.taskName;
      if (body.rewardAmount !== undefined) chore.rewardAmount = body.rewardAmount;
      if (body.isRecurring !== undefined) chore.isRecurring = body.isRecurring;
      if (body.intervalDays !== undefined) chore.intervalDays = body.intervalDays;
      if (body.suggestedTime !== undefined) chore.suggestedTime = body.suggestedTime;
      if (body.dueDate !== undefined) chore.dueDate = body.dueDate;

      await chore.save();

      const normalized = normalizeRecord(chore.toObject());
      return NextResponse.json(normalized);
   } catch (err) {
      console.error('PUT /api/chores/[choreId] error:', err);
      return NextResponse.json(
         { error: 'Failed to update chore' },
         { status: 500 }
      );
   }
}

/**
 * DELETE /api/chores/[choreId]
 * Soft deletes a chore (sets isActive to false)
 */
export async function DELETE(
   req: NextRequest,
   { params }: { params: { choreId: string } }
) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const chore = await Chore.findById(params.choreId);
      if (!chore) {
         return NextResponse.json({ error: 'Chore not found' }, { status: 404 });
      }

      // RBAC: Check delete permission
      const canDelete = await hasPermission(
         session.userId,
         chore.familyId.toString(),
         'chore',
         'delete'
      );
      if (!canDelete) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      chore.isActive = false;
      await chore.save();

      return NextResponse.json({ success: true });
   } catch (err) {
      console.error('DELETE /api/chores/[choreId] error:', err);
      return NextResponse.json(
         { error: 'Failed to delete chore' },
         { status: 500 }
      );
   }
}
