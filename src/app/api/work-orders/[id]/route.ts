import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import { sanitizeUpdate } from '@/lib/utils/sanitizeUpdate';
import mongoose from 'mongoose';
import { getAuthSession, unauthenticatedResponse, validationErrorResponse } from '@/lib/auth/auth';
import { hasPermission, assertPermission } from '@/lib/auth/rbac';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   const session = await getAuthSession();
   if (!session) return unauthenticatedResponse();

   await connectDB();

   const { id } = await params;

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse('Invalid ID format');
   }

   if (!id) {
      return validationErrorResponse('Missing ID');
   }

   const body = await req.json();
   const familyId = body.familyId;

   if (!familyId) {
      return validationErrorResponse('familyId is required');
   }

   // RBAC: Check update permission
   try {
      await assertPermission(session.userId, familyId, 'workOrder', 'update');
   } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }

   // Query with familyId for security - never query by _id alone
   const existing = await WorkOrder.findOne({ _id: id, familyId: familyId }).lean();
   if (!existing) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
   }

   let sanitized = sanitizeUpdate(WorkOrder, body);

   const updated = await WorkOrder.findOneAndUpdate({ _id: id, familyId: familyId }, sanitized, { new: true }).lean();
   if (!updated) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
   }
   return NextResponse.json({ success: true }, { status: 201 });
}

// get a specific work order given it's id (in the url of API)

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   const session = await getAuthSession();
   if (!session) return unauthenticatedResponse();

   await connectDB();
   const { id } = await params;

   if (!id) {
      return validationErrorResponse('Missing ID');
   }

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse('Invalid ID format');
   }

   const familyId = new URL(req.url).searchParams.get('familyId');
   if (!familyId) {
      return validationErrorResponse('familyId is required');
   }

   // RBAC: Check read permission
   const canRead = await hasPermission(session.userId, familyId, 'workOrder', 'read');
   if (!canRead) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }

   try {
      // Query with familyId for security - never query by _id alone
      const wo = await WorkOrder.findOne({ _id: id, familyId }).lean();
      if (!wo) {
         return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
      }
      return NextResponse.json({
         ...wo,
         _id: wo._id.toString(),
         familyId: wo.familyId?.toString?.() ?? '',
         vehicleId: wo.vehicleId?.toString?.() ?? '',
         createdAt: wo.createdAt?.toISOString?.() ?? null,
         updatedAt: wo.updatedAt?.toISOString?.() ?? null,
      });
   } catch (err) {
      console.error('Failed to fetch work order:', err);
      return NextResponse.json({ error: 'Failed to fetch work order' }, { status: 500 });
   }
}
