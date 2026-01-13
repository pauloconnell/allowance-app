import { NextResponse } from "next/server";
import Vehicle from "@/models/Vehicle";
import { connectDB } from "@/lib/mongodb";
import { sanitizeUpdate } from "@/lib/sanitizeUpdate";
import { normalizeVehicle } from "@/lib/normalizeVehicle";
import mongoose from "mongoose";



export async function PUT(req: Request, { params}:{ params: {vehicleId: string } }) {
  try {
    await connectDB();

    const body = await req.json();
    const sanitized = sanitizeUpdate(Vehicle, body);

    // Clean mileage input
    if (sanitized.mileage) {
      sanitized.mileage = Number(sanitized.mileage.toString().replace(/,/g, ""));
    }

    const updated = await Vehicle.findByIdAndUpdate(params.vehicleId, sanitized, {
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

export async function GET(req: Request, { params }:{ params: {vehicleId: string }} ) {
  const { vehicleId } = params;

  if (!mongoose.isValidObjectId(vehicleId)) { return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 }); }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return new Response(JSON.stringify({ error: `Not found, id:${vehicleId}` }), { status: 404 });
  }
const normalized = normalizeVehicle(vehicle);
  return new Response(JSON.stringify(normalized), { status: 200 });
}

