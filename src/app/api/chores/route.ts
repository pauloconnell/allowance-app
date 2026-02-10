import { NextResponse } from 'next/server';
import { sanitizeCreate } from '@/lib/utils/sanitizeCreate';
import { normalizeRecord } from '@/lib/SharedFE-BE-Utils/normalizeRecord';
import Chore from '@/models/Chore';
import { getAuthSession } from '@/lib/auth/auth';
import { hasPermission } from '@/lib/auth/rbac';
import type { IChoreFormData } from '@/types/IChore';

/**
 * GET /api/chores
 * Retrieves all chores for a family
 * Query params: familyId
 */
export async function GET(request: Request) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const familyId = searchParams.get('familyId');

      if (!familyId) {
         return NextResponse.json({ error: 'familyId is required' }, { status: 400 });
      }

      // RBAC: Check read permission
      const canRead = await hasPermission(session.userId, familyId, 'chore', 'read');
      if (!canRead) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const chores = await Chore.find({ familyId, isActive: true });
      const normalized = chores.map((c) => normalizeRecord(c.toObject()));

      return NextResponse.json(normalized);
   } catch (err) {
      console.error('GET /api/chores error:', err);
      return NextResponse.json(
         { error: 'Failed to fetch chores' },
         { status: 500 }
      );
   }
}

/**
 * POST /api/chores
 * Creates a new chore template
 * Body: { taskName, rewardAmount, isRecurring, intervalDays?, suggestedTime?, dueDate?, familyId }
 */
export async function POST(request: Request) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = (await request.json()) as IChoreFormData & { familyId?: string };
      const familyId = body.familyId;

      if (!familyId) {
         return NextResponse.json({ error: 'familyId is required' }, { status: 400 });
      }

      // RBAC: Check create permission
      const canCreate = await hasPermission(session.userId, familyId, 'chore', 'create');
      if (!canCreate) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Sanitize input
      const sanitized = sanitizeCreate(Chore, { ...body, familyId, isActive: true });

      const chore = new Chore(sanitized);
      await chore.save();

      const normalized = normalizeRecord(chore.toObject());
      return NextResponse.json(normalized, { status: 201 });
   } catch (err) {
      console.error('Error creating chore:', err);
      return NextResponse.json(
         { error: 'Failed to create chore' },
         { status: 500 }
      );
   }
}
