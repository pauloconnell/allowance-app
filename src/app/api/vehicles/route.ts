import { NextResponse, NextRequest } from 'next/server';
import { getAllChildren, createChild } from '@/lib/data/childService';
import { sanitizeCreate } from '@/lib/utils/sanitizeCreate';
import { normalizeRecord } from '@/lib/utils/normalizeRecord';
import Vehicle from '@/models/Vehicle';
import type { IFormVehicle } from "@/types/IFormVehicle";
import { getAuthSession, unauthenticatedResponse, validationErrorResponse } from '@/lib/auth/auth';
import { hasPermission } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) return unauthenticatedResponse();

      const { searchParams } = new URL(req.url);
      const familyId = searchParams.get('familyId');

      if (!familyId) {
         return validationErrorResponse('familyId is required');
      }

      // RBAC: Check read permission
      const canRead = await hasPermission(session.userId, familyId, 'child', 'read');
      if (!canRead) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const vehicles = await getAllChildren(familyId);
      const normalized = vehicles.map((v) => {
         const n = normalizeRecord(v);
         n.vehicleId = n._id; // model-specific ID field
         return n;
      });
      return NextResponse.json(normalized);
   } catch (err) {
      console.error('GET /api/vehicles error:', err);
      return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) return unauthenticatedResponse();

      const body = (await req.json()) as IFormVehicle & { familyId?: string };
      const familyId = body.familyId;

      if (!familyId) {
         return validationErrorResponse('familyId is required');
      }

      // RBAC: Check create permission
      const canCreate = await hasPermission(session.userId, familyId, 'child', 'create');
      if (!canCreate) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Clean mileage input and convert to number
      if (body.mileage) {
         body.mileage = body.mileage.toString().replace(/,/g, '');
      }

      // Sanitize input based on Child schema
      const sanitized = sanitizeCreate(Vehicle, { ...body, familyId });

      const child = await createChild(sanitized);

      return NextResponse.json({ success: true }, { status: 201 });
   } catch (err) {
      console.error('Error creating child:', err);
      return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
   }
}
