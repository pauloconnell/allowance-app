import { NextResponse } from "next/server";
import { createServiceRecord } from "@/lib/serviceRecords";

//POST /api/service-records


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const record = await createServiceRecord(body);
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("Error creating service record:", err);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
