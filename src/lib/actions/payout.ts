// /lib/actions/payout.ts
'use server';

import { connectDB } from '@/lib/mongodb';
import Child from '@/models/Child'; 
import { revalidatePath } from 'next/cache';

export async function recordPayout(childId: string, amount: number) {
  await connectDB();
  
  // Use $inc with a negative number to subtract the amount safely
  await Child.findByIdAndUpdate(childId, { 
    $inc: { currentBalance: -amount } 
  });

  revalidatePath('/protectedPages/parent-dashboard'); 
  return { success: true };
}