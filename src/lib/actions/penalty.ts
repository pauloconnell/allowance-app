"use server";

import DailyRecord from "@/models/DailyRecord";
import { revalidatePath } from "next/cache";

export async function cancelPenalty(formData: FormData) {


    const recordId = formData.get("recordId") as string;
    const index = Number(formData.get("index"));

    const record = await DailyRecord.findById(recordId);
    if (!record) throw new Error("Record not found");

    if (!record.penalties || !record.penalties[index]) {
        throw new Error("Penalty not found");
    }

    // Yesterday in YYYY-MM-DD format
    const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .slice(0, 10);

    record.penalties[index].endDate = yesterday;

    await record.save();
    const childId = record.childId.toString();
    const familyId = record.familyId.toString();


    // Revalidate the page that shows this record
    revalidatePath(`/protectedPages/${familyId}/penalties/${childId}`);
}
