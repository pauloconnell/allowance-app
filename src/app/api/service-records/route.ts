import { NextResponse } from "next/server";
import { createServiceRecord } from "@/lib/serviceRecords";
import ServiceRecord from "@/models/ServiceRecord"; 
import { sanitizeCreate } from "@/lib/sanitizeCreate";
//import { IWorkOrderInput } from "@/types/workorder"
import { IServiceRecord } from "@/types/IServiceRecord"

//POST /api/service-records

export async function POST(req: Request) {
  try {
    const body: Partial<IServiceRecord> = await req.json();
    const sanitized = sanitizeCreate<IServiceRecord>(ServiceRecord, body);


    const record = await createServiceRecord(sanitized );
    return NextResponse.json("Success", { status: 201 });
  } catch (err) {
    console.error("Error creating service record:", err);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
