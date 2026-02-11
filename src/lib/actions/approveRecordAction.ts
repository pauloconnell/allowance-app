'use server'; // This tells Next.js: "Do not send this to the browser!"

import { approveDailyRecord } from '@/lib/data/dailyRecordService';
import { revalidatePath } from 'next/cache';

export async function handleApproveRecordAction(recordId: string, userId: string, penalties: any) {
    // This runs ONLY on the server
    const result = await approveDailyRecord(recordId, userId, penalties);
    revalidatePath(`/protectedPages/[familyId]/daily-records`, 'page');
    return result;
}