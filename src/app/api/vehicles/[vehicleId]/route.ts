import { NextResponse, NextRequest } from "next/server";
import Vehicle from "@/models/Vehicle";
import { connectDB } from "@/lib/mongodb";
import { sanitizeUpdate } from "@/lib/sanitizeUpdate";
import { normalizeRecord } from "@/lib/normalizeRecord";
import mongoose from "mongoose";
import { getAuthSession, unauthenticatedResponse, validationErrorResponse } from '@/lib/auth';
import { assertPermission, hasPermission } from '@/lib/rbac';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ vehicleId: string }> }) {
  const session = await getAuthSession();
  if (!session) return unauthenticatedResponse();

  try {
    const { vehicleId } = await params;
    await connectDB();

    if (!mongoose.isValidObjectId(vehicleId)) {
      return validationErrorResponse("Invalid ID format");
    }

    const body = await req.json();
    const familyId = body.familyId;

    if (!familyId) {
      return validationErrorResponse('familyId is required');
    }

    // RBAC: Check update permission
    try {
      await assertPermission(session.userId, familyId, 'vehicle', 'update');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Query with familyId for security
    const existing = await Vehicle.findOne({ _id: vehicleId, familyId }).lean();
    if (!existing) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const sanitized = sanitizeUpdate(Vehicle, body);

    // Clean mileage input
    if (sanitized.mileage) {
      sanitized.mileage = Number(sanitized.mileage.toString().replace(/,/g, ""));
    }

    const updated = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, familyId },
      sanitized,
      { new: true }
    );

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
  const session = await getAuthSession();
  if (!session) return unauthenticatedResponse();

  const { vehicleId } = await params;
  try {
    await connectDB();

    if (!mongoose.isValidObjectId(vehicleId)) {
      return validationErrorResponse("Invalid ID format");
    }

    const familyId = new URL(req.url).searchParams.get('familyId');
    if (!familyId) {
      return validationErrorResponse('familyId is required');
    }

    // RBAC: Check read permission
    const canRead = await hasPermission(session.userId, familyId, 'vehicle', 'read');
    if (!canRead) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Query with familyId for security
    const vehicle = await Vehicle.findOne({ _id: vehicleId, familyId });
    if (!vehicle) {
      return NextResponse.json({ error: `Vehicle not found` }, { status: 404 });
    }

    const normalized = normalizeRecord(vehicle);
    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}

