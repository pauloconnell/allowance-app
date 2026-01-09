import { NextResponse } from "next/server";
import Vehicle from "@/models/Vehicle";
import { connectDB } from "@/lib/mongodb";


export async function PUT(req: Request, { params }) {
  try {
    await connectDB();

    const body = await req.json();

    // Clean mileage input
    if (body.mileage) {
      body.mileage = Number(body.mileage.toString().replace(/,/g, ""));
    }

    const updated = await Vehicle.findByIdAndUpdate(params.vehicleId, body, {
      new: true,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating vehicle:", err);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }) {
  const { vehicleId } = params;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return new Response(JSON.stringify({ error: `Not found, id:${vehicleId}` }), { status: 404 });
  }

  return new Response(JSON.stringify(vehicle), { status: 200 });
}

