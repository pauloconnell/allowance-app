import { NextResponse, NextRequest } from "next/server";
import Vehicle from "@/models/Vehicle";
import { connectDB } from "@/lib/mongodb";
import { sanitizeUpdate } from "@/lib/sanitizeUpdate";
import { normalizeRecord } from "@/lib/normalizeRecord";
import mongoose from "mongoose";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ vehicleId: string }> }) {
  try {
    const { vehicleId } = await params;
    await connectDB();
    if (!mongoose.isValidObjectId(vehicleId)) { return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 }); }
    const body = await req.json();
    const sanitized = sanitizeUpdate(Vehicle, body);

    // Clean mileage input
    if (sanitized.mileage) {
      sanitized.mileage = Number(sanitized.mileage.toString().replace(/,/g, ""));
    }

    const updated = await Vehicle.findByIdAndUpdate(vehicleId, sanitized, {
      new: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating vehicle:", err);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = await params;
  try {
    await connectDB();

    if (!mongoose.isValidObjectId(vehicleId)) { return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 }); }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return new Response(JSON.stringify({ error: `Not found, id:${vehicleId}` }), { status: 404 });
    }
    const normalized = normalizeRecord(vehicle);
    return new Response(JSON.stringify(normalized), { status: 200 });
  } catch (err) {
    console.error("Error updating vehicle:", err);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

