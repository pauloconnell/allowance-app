import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import { IWorkOrder } from '@/types/IWorkOrder';
import { sanitizeCreate } from '@/lib/sanitizeCreate';
import { sanitizeUpdate } from '@/lib/sanitizeUpdate';
import { IWorkOrderInput } from '@/types/IWorkOrder';
import { normalizeRecord } from '@/lib/normalizeRecord';

export async function POST(req: NextRequest) {
   try {
      await connectDB();

      const body: Partial<IWorkOrder> = await req.json();
      const sanitized = sanitizeCreate(WorkOrder, body);

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
      await connectDB();
      const body = await req.json();
      const id = body.id || body.workOrderId;
      const sanitized = sanitizeUpdate(WorkOrder, body);
      const updated = await WorkOrder.findByIdAndUpdate(id, sanitized, {
         new: true,
      }).lean();
      if (!updated) {
         return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true }, { status: 201 });
   } catch (e) {
      console.error('Failed to update work order:', e);
      return NextResponse.json({ error: 'Failed to update work order' }, { status: 500 });
   }
}

export async function GET(req: NextRequest) {
   try {
      await connectDB();
      const { searchParams } = new URL(req.url);
      const vehicleId = searchParams.get('vehicleId');

      const baseQuery = { status: 'open' }; // only get 'open'
      const query = vehicleId ? { ...baseQuery, vehicleId } : baseQuery; // handles both cases: all or just for this vehicle

      const workOrders = await WorkOrder.find(query).lean();

      // Normalize each record 
      const normalized = workOrders.map((wo) => {
         const n = normalizeRecord(wo);
        // now use PreviousId  n.workOrderId = n._id; // add model-specific ID field 
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
      await connectDB();

      const { searchParams } = new URL(req.url);
      const workOrderId = searchParams.get('workOrderId');

      if (!workOrderId) {
         return NextResponse.json({ error: 'Missing work order ID' }, { status: 400 });
      }

      const deleted = await WorkOrder.findByIdAndDelete(workOrderId).lean();

      if (!deleted) {
         return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
      }

      return NextResponse.json(
         { success: true }, {
            status: 200
      });
   } catch (err) {
      console.error('Failed to delete work order:', err);
      return NextResponse.json({ error: 'Failed to delete work order' }, { status: 500 });
   }
}
