import { NextResponse } from 'next/server';
import Child from '@/models/Child';
import { getAuthSession } from '@/lib/auth/auth';
import { hasPermission } from '@/lib/auth/rbac';
import { normalizeRecord } from '@/lib/SharedFE-BE-Utils/normalizeRecord';
import type { IChildFormData } from '@/types/IChild';

/**
 * GET /api/children/[childId]
 * Retrieves a specific child
 */
export async function GET(
   request: Request,
  { params } : {params:  Promise<{ childId: string }> }
) {
   const { childId } = await params;
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const child = await Child.findById(childId);
      if (!child) {
         return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }

      // RBAC: Check read permission
      const canRead = await hasPermission(
         session.userId,
         child.familyId.toString(),
         'child',
         'read'
      );
      if (!canRead) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const normalized = normalizeRecord(child.toObject());
      return NextResponse.json(normalized);
   } catch (err) {
      console.error('GET /api/children/[childId] error:', err);
      return NextResponse.json(
         { error: 'Failed to fetch child' },
         { status: 500 }
      );
   }
}

/**
 * PUT /api/children/[childId]
 * Updates a child's information
 */
export async function PUT(
   request: Request,
  { params } : {params:  Promise<{ childId: string }> }
) {
   const { childId } = await params;
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const child = await Child.findById(childId);
      if (!child) {
         return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }

      // RBAC: Check write permission
      const canWrite = await hasPermission(
         session.userId,
         child.familyId.toString(),
         'child',
         'update'
      );
      if (!canWrite) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = (await request.json()) as Partial<IChildFormData>;

      // Only allow updating these fields
      if (body.name) child.name = body.name;
      if (body.age !== undefined) child.age = body.age;
      if (body.avatarUrl !== undefined) child.avatarUrl = body.avatarUrl;

      await child.save();

      const normalized = normalizeRecord(child.toObject());
      return NextResponse.json(normalized);
   } catch (err) {
      console.error('PUT /api/children/[childId] error:', err);
      return NextResponse.json(
         { error: 'Failed to update child' },
         { status: 500 }
      );
   }
}

/**
 * DELETE /api/children/[childId]
 * Deletes a child
 */
export async function DELETE(
   request: Request,
  { params } : {params:  Promise<{ childId: string }> }
) {
   const { childId } = await params;
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const child = await Child.findById(childId);
      if (!child) {
         return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }

      // RBAC: Check delete permission
      const canDelete = await hasPermission(
         session.userId,
         child.familyId.toString(),
         'child',
         'delete'
      );
      if (!canDelete) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await Child.deleteOne({ _id: childId });

      return NextResponse.json({ success: true });
   } catch (err) {
      console.error('DELETE /api/children/[childId] error:', err);
      return NextResponse.json(
         { error: 'Failed to delete child' },
         { status: 500 }
      );
   }
}
