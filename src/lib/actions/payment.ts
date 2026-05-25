'use server';

import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Child from '@/models/Child';
//import { revalidatePath } from 'next/cache';
import { getSession } from '@auth0/nextjs-auth0';
import { hasPermission } from '@/lib/auth/rbac';
import { Types } from "mongoose";
//import { Child, Payment } from "@/models";
//import { connectDB } from "@/lib/db";
//import { getSession } from "@/lib/auth";
//import { hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

interface RecordPaymentInput {
  childId: string;
  familyId: string;
  place: string;
  paymentAmount: number;
  notes?: string;
  paymentDate?: string;
}

interface RecordPaymentResult {
  success: boolean;
  payment: any; // You can replace with PaymentDocument if you have it typed
}

export async function recordPayment({
  childId,
  familyId,
  place,
  paymentAmount,
  notes,
  paymentDate,
}: RecordPaymentInput): Promise<RecordPaymentResult> {
  await connectDB();

  const session = await getSession();
  if (!session?.user) {
    throw new Error("NOT_LOGGED_IN");
  }

  const userId = session.user.sub;
  const canCreate = await hasPermission(
    userId,
    familyId,
    "daily-record",
    "create"
  );

  if (!canCreate) {
    throw new Error("UNAUTHORIZED");
  }

  if (!place.trim() || paymentAmount <= 0) {
    throw new Error("Invalid payment data");
  }

  const normalizedPaymentDate =
    paymentDate || new Date().toISOString().slice(0, 10);

  // Validate ObjectId
  if (!Types.ObjectId.isValid(childId)) {
    throw new Error("Invalid childId");
  }

  // ⭐ Atomic update: get previous balance + update child balance in one DB roundtrip
  const childBefore = await Child.findOneAndUpdate(
    { _id: childId, familyId },
    { $inc: { currentBalance: paymentAmount } },
    { new: false }
  ).lean();

  if (!childBefore) {
    throw new Error('Child not found');
  }

  const previousBalance = childBefore.currentBalance ?? 0;

  // Create payment record
  const payment = await Payment.create({
    childId,
    familyId,
    place: place.trim(),
    previousBalance,
    paymentAmount,
    notes: notes?.trim() || "",
    paymentDate: normalizedPaymentDate,
  });

  // Revalidate UI
  revalidatePath(`/protectedPages/${familyId}/payments/${childId}`);
  revalidatePath(`/protectedPages/${familyId}/dashboard`);

  return {
    success: true,
    payment: payment.toObject(),
  };
}


