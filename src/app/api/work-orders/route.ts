import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkOrder from "@/models/WorkOrder";
import { IWorkOrder } from "@/types/workorder";

export async function POST(req: Request) {
  try {
    await connectDB();

    const data: IWorkOrder = await req.json();

    const wo = await WorkOrder.create(data);

    return NextResponse.json({
      ...wo.toObject(),
      _id: wo._id.toString(),
      vehicleId: wo.vehicleId.toString(),
      createdAt: wo.createdAt.toISOString(),
      updatedAt: wo.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("Failed to create work order:", err);
    return NextResponse.json(
      { error: "Failed to create work order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const workOrders = await WorkOrder.find().lean();

    return NextResponse.json(
      workOrders.map((wo) => ({
        ...wo,
        _id: wo._id.toString(),
        vehicleId: wo.vehicleId.toString(),
        createdAt: wo.createdAt?.toISOString?.() ?? null,
        updatedAt: wo.updatedAt?.toISOString?.() ?? null,
      }))
    );
  } catch (err) {
    console.error("Failed to fetch work orders:", err);
    return NextResponse.json(
      { error: "Failed to fetch work orders" },
      { status: 500 }
    );
  }
}
