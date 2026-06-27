'use server';

import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Child from '@/models/Child';
import { getSession } from '@auth0/nextjs-auth0';
import { hasPermission } from '@/lib/auth/rbac';
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

interface RecordPaymentInput {
  childId: string;
  familyId: string;
  place: string;
  paymentAmount: number;
  notes?: string;
  paymentDate?: string;
}

export async function recordPayment({
  childId,
  familyId,
  place,
  paymentAmount,
  notes,
  paymentDate,
}: RecordPaymentInput): Promise<{ success: boolean }> {
  await connectDB();

  const session = await getSession();
  if (!session?.user) throw new Error("NOT_LOGGED_IN");

  const canCreate = await hasPermission(session.user.sub, familyId, "daily-record", "create");
  if (!canCreate) throw new Error("UNAUTHORIZED");

  if (!place.trim() || paymentAmount <= 0) throw new Error("Invalid payment data");

  if (!Types.ObjectId.isValid(childId)) throw new Error("Invalid childId");

  const normalizedPaymentDate = paymentDate || new Date().toISOString().slice(0, 10);

  const childBefore = await Child.findOneAndUpdate(
    { _id: childId, familyId },
    { $inc: { currentBalance: -Math.round(paymentAmount * 100) / 100 } }, // JS floating point 2 decimal rounding fix
    { new: false }
  ).lean();

  if (!childBefore) throw new Error('Child not found');

  await Payment.create({
    childId,
    familyId,
    place: place.trim(),
    previousBalance: Math.round((childBefore.currentBalance ?? 0) * 100) / 100, // JS floating point 2 decimal rounding fix
    paymentAmount,
    notes: notes?.trim() || "",
    paymentDate: normalizedPaymentDate,
  });

  revalidatePath(`/protectedPages/${familyId}/payments/${childId}`);
  revalidatePath(`/protectedPages/${familyId}/dashboard`);

  return { success: true };
}
