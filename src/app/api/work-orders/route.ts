import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import { IWorkOrder } from '@/types/workorder';

export async function POST(req: Request) {
   try {
      await connectDB();

      const data: IWorkOrder = await req.json();
      console.log('Schema paths:', Object.keys(WorkOrder.schema.paths));

      const wo = await WorkOrder.create(data);
      console.log('server got new work order with details: ', data, wo);
      return NextResponse.json({
         ...wo.toObject(),
         workOrderId: wo._id.toString(),
         vehicleId: wo.vehicleId.toString(),
         createdAt: wo.createdAt.toISOString(),
         updatedAt: wo.updatedAt.toISOString(),
      });
   } catch (err) {
      console.error('Failed to create work order:', err);
      return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 });
   }
}

export async function PUT(req, { params }) {
   await connectDB();
   const body = await req.json();
   const id = params.id;
   const updated = await WorkOrder.findByIdAndUpdate(id, body, { new: true }).lean();
   return NextResponse.json(updated);
}

export async function GET(req) {
   try {
      await connectDB();
      const { searchParams } = new URL(req.url);
      const vehicleId = searchParams.get('vehicleId');
      const baseQuery = { status: 'open' }; // only get 'open'
      const query = vehicleId ? { ...baseQuery, vehicleId } : baseQuery; // handles both cases: all or just for this vehicle
      const workOrders = await WorkOrder.find(query).lean();
      return NextResponse.json(
         workOrders.map((wo) => ({
            ...wo,
            _id: wo._id.toString(),
            vehicleId: wo.vehicleId?.toString?.() ?? '',
            createdAt: wo.createdAt?.toISOString?.() ?? null,
            updatedAt: wo.updatedAt?.toISOString?.() ?? null,
         }))
      );
   } catch (err) {
      console.error('Failed to fetch work orders:', err);
      return NextResponse.json({ error: 'Failed to fetch work orders' }, { status: 500 });
   }
}

export async function DELETE(req) {
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

      return NextResponse.json({
         ...deleted,
         _id: deleted._id.toString(),
         vehicleId: deleted.vehicleId?.toString?.() ?? '',
      });
   } catch (err) {
      console.error('Failed to delete work order:', err);
      return NextResponse.json({ error: 'Failed to delete work order' }, { status: 500 });
   }
}
