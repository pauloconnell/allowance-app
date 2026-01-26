import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import { IWorkOrder } from '@/types/IWorkOrder';
import { sanitizeCreate } from '@/lib/sanitizeCreate';
import { sanitizeUpdate } from '@/lib/sanitizeUpdate';
import { normalizeRecord } from '@/lib/normalizeRecord';
import { getAuthSession, unauthenticatedResponse, validationErrorResponse } from '@/lib/auth';
import { hasPermission, assertPermission } from '@/lib/rbac';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) return unauthenticatedResponse();

      await connectDB();

      const body: Partial<IWorkOrder> & { familyId?: string } = await req.json();
      const familyId = body.familyId;

      if (!familyId) {
         return validationErrorResponse('familyId is required');
      }

      // RBAC: Check create permission
      const canCreate = await hasPermission(session.userId, familyId, 'workOrder', 'create');
      if (!canCreate) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const sanitized = sanitizeCreate<Partial<IWorkOrder>>(WorkOrder, { ...body, companyId: familyId });

      // Create work order
      const wo = await WorkOrder.create(sanitized);

      return NextResponse.json({ success: true }, { status: 201 });
   } catch (err) {
      console.error('Failed to create work order:', err);
      return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 });
   }
}

export async function PUT(req: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) return unauthenticatedResponse();

      await connectDB();
      const body = await req.json();
      const id = body.id || body.workOrderId;
      const familyId = body.familyId;

      if (!id) {
         return validationErrorResponse('ID is required');
      }

      if (!familyId) {
         return validationErrorResponse('familyId is required');
      }

      // Verify ID format
      if (!mongoose.isValidObjectId(id)) {
         return validationErrorResponse('Invalid ID format');
      }

      // RBAC: Check update permission
      await assertPermission(session.userId, familyId, 'workOrder', 'update');

      // Query with familyId for security
      const existing = await WorkOrder.findOne({ _id: id, companyId: familyId }).lean();
      if (!existing) {
         return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
      }

      const sanitized = sanitizeUpdate(WorkOrder, body);
      const updated = await WorkOrder.findOneAndUpdate(
         { _id: id, companyId: familyId },
         sanitized,
         { new: true }
      ).lean();

      if (!updated) {
         return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true }, { status: 201 });
   } catch (e) {
      console.error('Failed to update work order:', e);
      if (e instanceof Error && e.message.includes('Unauthorized')) {
         return NextResponse.json({ error: e.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Failed to update work order' }, { status: 500 });
   }
}

export async function GET(req: NextRequest) {
   try {
      const session = await getAuthSession(req);
      if (!session) return unauthenticatedResponse();

      await connectDB();
      const { searchParams } = new URL(req.url);
      const vehicleId = searchParams.get('vehicleId');
      const familyId = searchParams.get('familyId');

      if (!familyId) {
         return validationErrorResponse('familyId is required');
      }

      // RBAC: Check read permission
      const canRead = await hasPermission(session.userId, familyId, 'workOrder', 'read');
      console.log("GET /api/work-orders - canRead:", canRead);
      if (!canRead) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const baseQuery: any = { status: 'open', companyId: familyId }; // only get 'open' + verify family
      const query = vehicleId ? { ...baseQuery, vehicleId } : baseQuery;

      const workOrders = await WorkOrder.find(query).lean();
      console.log({workOrders} );
      // Normalize each record 
      const normalized = workOrders.map((wo) => {
         const n = normalizeRecord(wo);
         return n;
      });
      return NextResponse.json(normalized);
   } catch (err) {
      console.error('Failed to fetch work orders:', err);
      return NextResponse.json({ error: 'Failed to fetch work orders' }, { status: 500 });
   }
}

export async function DELETE(req: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) return unauthenticatedResponse();

      await connectDB();

      const { searchParams } = new URL(req.url);
      const workOrderId = searchParams.get('workOrderId');
      const familyId = searchParams.get('familyId');

      if (!workOrderId) {
         return validationErrorResponse('Missing work order ID');
      }

      if (!familyId) {
         return validationErrorResponse('familyId is required');
      }

      // RBAC: Check delete permission
      await assertPermission(session.userId, familyId, 'workOrder', 'delete');

      // Query with familyId for security
      const deleted = await WorkOrder.findOneAndDelete({
         $or: [{ _id: workOrderId }, { workOrderId }],
         companyId: familyId,
      }).lean();

      if (!deleted) {
         return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
      }

      return NextResponse.json(
         { success: true }, {
            status: 200
      });
   } catch (err) {
      console.error('Failed to delete work order:', err);
      if (err instanceof Error && err.message.includes('Unauthorized')) {
         return NextResponse.json({ error: err.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Failed to delete work order' }, { status: 500 });
   }
}
