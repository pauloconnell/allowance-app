'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getOrCreateTodaysDailyRecord, createDailyRecord } from '@/lib/data/dailyRecordService';
import { addDaysToDateString, getLocalTodayString } from '@/lib/utils/dateHelper';
import { connectDB } from '@/lib/mongodb'; // Updated to your actual DB utility
import  DailyRecord  from '@/models/DailyRecord'; 

/**
 * 1. Logic for creating/redirecting to today's record
 */
export async function handleCreateRecordForToday(formData: FormData){//childId: string, familyId: string) {       // use form data because server function being sent in html, so must use form data to capture variables from client
     const childId = formData.get("childId") as string;
  const familyId = formData.get("familyId") as string;
  
   if (!childId || !familyId) {
      console.error('Child ID and Family ID are required.');
      return;
   } 
   
   await connectDB();
   
   console.log("Fetching/Creating record for today...");
   const newRecord = await getOrCreateTodaysDailyRecord(childId, familyId);
   
   // We only need the string ID for the redirect
   const newId = newRecord._id.toString();
   
   redirect(`/protectedPages/${familyId}/daily-records/${newId}?childId=${childId}`);
}


/**
 * 1.5 Logic for creating/redirecting to yesterday's record
 */
export async function handleCreateRecordForYesterday(formData: FormData) {  //childId: string, familyId: string) {
   const childId = formData.get("childId") as string;
  const familyId = formData.get("familyId") as string;
   if (!childId || !familyId) {
      console.error('Child ID and Family ID are required.');
      return;
   } 
   
   await connectDB();
   
   console.log("Fetching/Creating record for yesterday...");
   // need to get today's record for comparison in function:
   const recentRecord = await getOrCreateTodaysDailyRecord(childId, familyId);
   const date = addDaysToDateString(getLocalTodayString(), -1);

     // 1. Check if yesterday's record already exists - if so, we can just redirect to it instead of creating a duplicate

  const existingRecord = await DailyRecord.findOne({
    childId,
    familyId,
    date,
  });

  if (existingRecord) {
    return redirect(
      `/protectedPages/${familyId}/daily-records/parentReview/${existingRecord._id}?childId=${childId}`
    );
  }

  // 2. Create new record if none exists

   const newRecord = await createDailyRecord(childId, familyId, recentRecord, date );
   
   // We only need the string ID for the redirect
   const newId = newRecord._id.toString();
   
   redirect(`/protectedPages/${familyId}/daily-records/parentReview/${newId}?childId=${childId}`);
}

/**
 * 2. Logic for updating specific chore status (The Sync Bridge)
 */
export async function updateChoreStatus(recordId: string, choreId: string, newStatus: number, isParent?: boolean) {  // add isParent to update isOverridden - WIP  TBD
   try {
      await connectDB();

      // Updates only the specific chore within the array using the positional operator $
      const result = await DailyRecord.updateOne(
         { _id: recordId, "choresList._id": choreId },
         { $set: { "choresList.$.completionStatus": newStatus } }
      );

      if (result.modifiedCount === 0) {
         return { success: false, error: 'No record found or no changes made' };
      }

      // Revalidate the dynamic route to update the UI
      // Note: Make sure the path matches your actual folder structure
      revalidatePath(`/protectedPages/[familyId]/daily-records/[id]`);
      
      return { success: true };
   } catch (error) {
      console.error("Failed to update chore status:", error);
      return { success: false, error: 'Database update failed' };
   }
}