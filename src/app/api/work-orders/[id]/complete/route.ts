import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import ServiceRecord from '@/models/ServiceRecord';
import { createNextWorkOrder } from '@/lib/createNextWorkOrder';
import { IWorkOrder } from '@/types/IWorkOrder';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   await connectDB();

   const { id } = await params;

   if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
   }
   const body = await req.json(); // contains completedBy

   const workOrder = await WorkOrder.findById(id).lean();
   if (!workOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
   }

   // 1. Update the work order to mark 'completed'
   await WorkOrder.findByIdAndUpdate(id, {
      status: 'completed',
      completedBy: body.completedBy,
      completedDate: new Date(),
   });

   // 2. Create the service record
   const serviceRecord = await ServiceRecord.create({
      vehicleId: workOrder.vehicleId,
      serviceType: workOrder.serviceType,
      serviceDate: new Date(),
      completedDate: new Date(),
      serviceDueDate: workOrder.serviceDueDate ?? null,
      serviceDueKM: workOrder.serviceDueKM ?? null,
      mileage: workOrder.mileage,
      location: workOrder.location ?? [],
      notes: workOrder.notes ?? '',
      completedBy: body.completedBy,
      serviceFrequencyKM: workOrder.serviceFrequencyKM ?? null,
      serviceFrequencyWeeks: workOrder.serviceFrequencyWeeks ?? null,
   });

   if (workOrder.isRecurring) {
      const next: Partial<IWorkOrder> = {
         vehicleId: workOrder.vehicleId,
         nickName: workOrder.nickName,
         companyId: workOrder.companyId,
         previousWorkOrderId: workOrder._id,
         serviceType: workOrder.serviceType,
         isRecurring: true,
         location: workOrder.location ?? [],
         notes: workOrder.notes ?? '',
         mileage: String(workOrder.mileage),
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
         await createNextWorkOrder(workOrder);
      } catch (err) {
         console.error('Failed to create next recurring work order:', err); // Do NOT throw — completion should still succeed
      }
   }
   return NextResponse.json({ success: true }, { status: 201 });
}
