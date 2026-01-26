import { NextResponse, NextRequest } from "next/server";
import { createDailyRecord } from "@/lib/serviceRecords";
import ServiceRecord from "@/models/ServiceRecord"; 
import { sanitizeCreate } from "@/lib/sanitizeCreate";
import { IServiceRecord } from "@/types/IServiceRecord"
import { getAuthSession, unauthenticatedResponse, validationErrorResponse } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';

//POST /api/service-records

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthenticatedResponse();

    const body: Partial<IServiceRecord> & { familyId?: string } = await req.json();
    const familyId = body.familyId;

    if (!familyId) {
      return validationErrorResponse('familyId is required');
    }

    // RBAC: Check create permission
    const canCreate = await hasPermission(session.userId, familyId, 'daily-record', 'create');
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sanitized = sanitizeCreate<Partial<IServiceRecord>>(ServiceRecord, { ...body, familyId });

    const record = await createDailyRecord(sanitized);
    return NextResponse.json("Success", { status: 201 });
  } catch (err) {
    console.error("Error creating daily record:", err);
    return NextResponse.json({ error: "Failed to create daily record" }, { status: 500 });
  }
}
