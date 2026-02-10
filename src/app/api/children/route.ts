import { NextResponse } from 'next/server';
import { sanitizeCreate } from '@/lib/utils/sanitizeCreate';
import { normalizeRecord } from '@/lib/SharedFE-BE-Utils/normalizeRecord';
import Child from '@/models/Child';
import { getAuthSession } from '@/lib/auth/auth';
import { hasPermission } from '@/lib/auth/rbac';
import type { IChildFormData } from '@/types/IChild';

/**
 * GET /api/children
 * Retrieves all children in a family
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
      const canRead = await hasPermission(session.userId, familyId, 'child', 'read');
      if (!canRead) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const children = await Child.find({ familyId });
      const normalized = children.map((c) => normalizeRecord(c.toObject()));

      return NextResponse.json(normalized);
   } catch (err) {
      console.error('GET /api/children error:', err);
      return NextResponse.json(
         { error: 'Failed to fetch children' },
         { status: 500 }
      );
   }
}

/**
 * POST /api/children
 * Creates a new child
 * Body: { name, age, avatarUrl?, familyId }
 */
export async function POST(request: Request) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = (await request.json()) as IChildFormData & { familyId?: string };
      const familyId = body.familyId;

      if (!familyId) {
         return NextResponse.json({ error: 'familyId is required' }, { status: 400 });
      }

      // RBAC: Check create permission
      const canCreate = await hasPermission(session.userId, familyId, 'child', 'create');
      if (!canCreate) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Sanitize input
      const sanitized = sanitizeCreate(Child, { ...body, familyId });

      const child = new Child(sanitized);
      await child.save();

      const normalized = normalizeRecord(child.toObject());
      return NextResponse.json(normalized, { status: 201 });
   } catch (err) {
      console.error('Error creating child:', err);
      return NextResponse.json(
         { error: 'Failed to create child' },
         { status: 500 }
      );
   }
}
