import Chore from "@/models/Chore";
import Child from "@/models/Child";
import mongoose from "mongoose";
import { IChore } from '@/types/IChore'


export async function createNextChore(nextChore: Partial<IChore>) {

   if (!mongoose.isValidObjectId(nextChore.childId)) {
     return null; // or throw an error
   }
   
   const child = await Child.findById(nextChore.childId);
   if (!child) return null;

   // If all required fields are provided, use them directly
   if (
      nextChore.familyId &&
      nextChore.taskName &&
      nextChore.rewardAmount !== undefined
   ) {
      // Create the new chore with provided values
      await Chore.create({
         familyId: nextChore.familyId,
         childId: nextChore.childId,
         taskName: nextChore.taskName,
         rewardAmount: nextChore.rewardAmount,
         notes: nextChore.notes ?? "",
         isActive: true,
         isRecurring: nextChore.isRecurring ?? false,
      });
   } else {
      // Fallback: Create with minimal data
      await Chore.create({
         familyId: nextChore.familyId,
         childId: nextChore.childId,
         taskName: nextChore.taskName,
         rewardAmount: nextChore.rewardAmount,
         notes: nextChore.notes ?? "",
         isActive: true,
         isRecurring: false,
      });
   }
}

// Backward compatibility alias
export const createNextWorkOrder = createNextChore;
