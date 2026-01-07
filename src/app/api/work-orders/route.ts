import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import { IWorkOrder } from '@/types/workorder';

export async function POST(req: Request) {
   try {
      await connectDB();

      const data: IWorkOrder = await req.json();

      const wo = await WorkOrder.create(data);
      console.log('server got new work order with details: ', data);
      return NextResponse.json({
         ...wo.toObject(),
         _id: wo._id.toString(),
         vehicleId: wo.vehicleId.toString(),
         createdAt: wo.createdAt.toISOString(),
         updatedAt: wo.updatedAt.toISOString(),
      });
   } catch (err) {
      console.error('Failed to create work order:', err);
      return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 });
   }
}

export async function GET(req) {
   try {
      await connectDB();
      const { searchParams } = new URL(req.url);
      const vehicleId = searchParams.get('vehicleId');
      const query = vehicleId ? { vehicleId } : {};       // handles both cases: all or just for this vehicle
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing work order ID" },
        { status: 400 }
      );
    }

    const deleted = await WorkOrder.findOneAndDelete({
      $or: [{ _id: id }, { workOrderId: id }],
    }).lean();

    if (!deleted) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...deleted,
      _id: deleted._id.toString(),
      vehicleId: deleted.vehicleId?.toString?.() ?? "",
    });
  } catch (err) {
    console.error("Failed to delete work order:", err);
    return NextResponse.json(
      { error: "Failed to delete work order" },
      { status: 500 }
    );
  }
}
