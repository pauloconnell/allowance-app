import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import { IWorkOrder } from '@/types/workorder';

export async function PUT(req, { params }) {
   await connectDB();
   const body = await req.json();
   const id = params.id;

   if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
   }
   const updated = await WorkOrder.findByIdAndUpdate(id, body, { new: true }).lean();
   if (!updated) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
   }
   return NextResponse.json(updated);
}
