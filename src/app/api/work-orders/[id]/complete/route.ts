import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import ServiceRecord from '@/models/ServiceRecord';
import { createNextChore } from '@/lib/chores';
import { IWorkOrder } from '@/types/IWorkOrder';
import { getAuthSession, unauthenticatedResponse, validationErrorResponse } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

   const body = await req.json(); // contains completedBy

   if (!body.completedBy) {
      return validationErrorResponse('completedBy is required');
   }

   // 1. Fetch the work order to get familyId
   const workOrder = await WorkOrder.findById(id).lean();
   if (!workOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
   }

   const familyId = workOrder.familyId?.toString() ?? '';
   if (!familyId) {
      return NextResponse.json({ error: 'Work order missing company context' }, { status: 400 });
   }

   // 2. RBAC: Verify user belongs to family
   const canComplete = await hasPermission(session.userId, familyId, 'chore', 'complete');
   if (!canComplete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }

   // 3. Update the work order to mark 'completed' with familyId in query
   await WorkOrder.findOneAndUpdate(
      { _id: id, familyId },
      {
         status: 'completed',
         completedBy: body.completedBy,
         completedDate: new Date(),
      }
   );

   // 4. Create the service record with familyId
   const serviceRecord = await ServiceRecord.create({
      familyId, // Explicitly set familyId
      vehicleId: workOrder.vehicleId,
      workOrderId: workOrder._id,
      serviceType: workOrder.serviceType,
      serviceDate: new Date(),
      serviceDueDate: workOrder.serviceDueDate ?? null,
      serviceDueKM: workOrder.serviceDueKM ?? null,
      mileage: workOrder.mileage,
      location: workOrder.location ?? [],
      notes: workOrder.notes ?? '',
      completedBy: body.completedBy,
      serviceFrequencyKM: workOrder.serviceFrequencyKM ?? null,
      serviceFrequencyWeeks: workOrder.serviceFrequencyWeeks ?? null,
      isRecurring: workOrder.isRecurring ?? false,
   });

   // 5. Handle recurring work orders
   if (workOrder.isRecurring) {
      const next: Partial<IWorkOrder> = {
         familyId, // Explicitly set familyId
         vehicleId: workOrder.vehicleId,
         nickName: workOrder.nickName,
         previousWorkOrderId: workOrder._id,
         serviceType: workOrder.serviceType,
         isRecurring: true,
         location: workOrder.location ?? [],
         notes: workOrder.notes ?? '',
         mileage: workOrder.mileage,
         serviceFrequencyKM: workOrder.serviceFrequencyKM ?? null,
         serviceFrequencyWeeks: workOrder.serviceFrequencyWeeks ?? null,
      };

      // Calculate next due KM
      if (workOrder.serviceFrequencyKM) {
         next.serviceDueKM = (workOrder.mileage ?? 0) + workOrder.serviceFrequencyKM;
      }

      // Calculate next due date
      if (workOrder.serviceFrequencyWeeks) {
         const nextDate = new Date(workOrder.serviceDate ?? Date.now());
         nextDate.setDate(nextDate.getDate() + workOrder.serviceFrequencyWeeks * 7);
         next.serviceDueDate = nextDate.toISOString().split('T')[0];
      }

      try {
         await createNextWorkOrder(next as IWorkOrder);
      } catch (err) {
         console.error('Failed to create next recurring work order:', err);
         // Do NOT throw — completion should still succeed
      }
   }

   return NextResponse.json({ success: true }, { status: 201 });
}
