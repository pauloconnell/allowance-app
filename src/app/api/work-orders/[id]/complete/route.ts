import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import ServiceRecord from '@/models/ServiceRecord';
import { createNextWorkOrder } from '@/lib/createNextWorkOrder';

export async function PUT(req, { params }) {
  await connectDB();

  const id = params.id;
  const body = await req.json(); // contains completedBy

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  const workOrder = await WorkOrder.findById(id).lean();
  if (!workOrder) {
    return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
  }

  // 1. Update the work order to mark 'completed'
  await WorkOrder.findByIdAndUpdate(id, {
    status: 'Completed',
    completedBy: body.completedBy,
    completedDate: new Date(),
  });

  // 2. Create the service record
  const serviceRecord = await ServiceRecord.create({
    vehicleId: workOrder.vehicleId,
    serviceType: workOrder.serviceType,
    serviceDate: new Date(),
    serviceDueDate: workOrder.serviceDueDate,
    serviceDueKM: workOrder.serviceDueKM,
    mileage: workOrder.mileage,
    location: workOrder.location,
    notes: workOrder.notes,
    completedBy: workOrder.completedBy,
    serviceFrequencyKM: workOrder.serviceFrequencyKM,
    serviceFrequencyWeeks: workOrder.serviceFrequencyWeeks,
  });

  if (workOrder.isRecurring) {
    try { await createNextWorkOrder(workOrder); 
    } catch (err) {
      console.error("Failed to create next recurring work order:", err); // Do NOT throw — completion should still succeed 
    }
  }
    return NextResponse.json({ serviceRecordId: serviceRecord._id });
  }
