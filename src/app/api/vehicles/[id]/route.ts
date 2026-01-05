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

    const updated = await Vehicle.findByIdAndUpdate(params.id, body, {
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
