import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import { sanitizeUpdate } from '@/lib/sanitizeUpdate';
import { normalizeRecord } from '@/lib/normalizeRecord';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   await connectDB();

   const { id } = await params;

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
   }

   if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
   }

   const body = await req.json();
   let sanitized = sanitizeUpdate(WorkOrder, body);

   const updated = await WorkOrder.findByIdAndUpdate(id, sanitized, { new: true }).lean();
   if (!updated) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
   }
   return NextResponse.json({ success: true }, { status: 201 });
}

// get a specific work order given id (in the url of API)

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   await connectDB();
   const { id } = await params;
   if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
   }
   if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
   }
   try {
      const wo = await WorkOrder.findById(id).lean();
      if (!wo) {
         return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
      }
      return NextResponse.json({
         ...wo,
         _id: wo._id.toString(),
         vehicleId: wo.vehicleId?.toString?.() ?? '',
         createdAt: wo.createdAt?.toISOString?.() ?? null,
         updatedAt: wo.updatedAt?.toISOString?.() ?? null,
      });
   } catch (err) {
      console.error('Failed to fetch work order:', err);
      return NextResponse.json({ error: 'Failed to fetch work order' }, { status: 500 });
   }
}
