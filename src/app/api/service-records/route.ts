import { NextResponse } from "next/server";
import { createServiceRecord } from "@/lib/serviceRecords";
import ServiceRecord from "@/models/ServiceRecord"; 
import { sanitizeCreate } from "@/lib/sanitizeCreate";
import { IWorkOrderInput } from "@/types/workorder"


//POST /api/service-records

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sanitized = sanitizeCreate(ServiceRecord, body);


    const record = await createServiceRecord(sanitized as IWorkOrderInput);
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("Error creating service record:", err);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
