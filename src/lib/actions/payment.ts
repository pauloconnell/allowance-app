'use server';

import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Child from '@/models/Child';
import { revalidatePath } from 'next/cache';
import { getSession } from '@auth0/nextjs-auth0';
import { hasPermission } from '@/lib/auth/rbac';

export async function recordPayment({
   childId,
   familyId,
   place,
   paymentAmount,
   notes,
   paymentDate,
}: {
   childId: string;
   familyId: string;
   place: string;
   paymentAmount: number;
   notes?: string;
   paymentDate?: string;
}) {
   await connectDB();

   const session = await getSession();
   if (!session?.user) {
      throw new Error('NOT_LOGGED_IN');
   }

   const userId = session.user.sub;
   const canCreate = await hasPermission(userId, familyId, 'daily-record', 'create');
   if (!canCreate) {
      throw new Error('UNAUTHORIZED');
   }

   if (!place.trim() || paymentAmount <= 0) {
      throw new Error('Invalid payment data');
   }

   const normalizedPaymentDate = paymentDate || new Date().toISOString().slice(0, 10);

   const payment = await Payment.create({
      childId,
      familyId,
      place: place.trim(),
      paymentAmount,
      notes: notes?.trim() || '',
      paymentDate: normalizedPaymentDate,
   });

   // Update child balance (add payment amount)
   await Child.findByIdAndUpdate(childId, {
      $inc: { currentBalance: paymentAmount },
   });

   revalidatePath(`/protectedPages/${familyId}/payments/${childId}`);
   revalidatePath(`/protectedPages/${familyId}/dashboard`);

   return {
      success: true,
      payment: payment.toObject(),
   };
}
