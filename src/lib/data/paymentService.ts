import { connectDB } from '../mongodb';
import Payment from '@/models/Payment';
import Child from '@/models/Child';
import mongoose from 'mongoose';
import { hasPermission } from '@/lib/auth/rbac';
import { getSession } from '@auth0/nextjs-auth0';

async function _validateAccess(familyId: string, action: 'read' | 'create' = 'read') {
   const session = await getSession();
   if (!session?.user) throw new Error('NOT_LOGGED_IN');

   const userId = session.user.sub;
   if (!familyId) throw new Error('FAMILY_ID_REQUIRED');

   const allowed = await hasPermission(userId, familyId, 'daily-record', action);
   if (!allowed) throw new Error('UNAUTHORIZED_ACCESS');

   return { userId, session };
}

export interface IPayment {
   _id: string;
   familyId: string;
   childId: string;
   place: string;
   paymentAmount: number;
   previousBalance: number;
   notes: string;
   paymentDate: string;
   createdAt?: string;
   updatedAt?: string;
}

export async function getPaymentsByChildId(
   childId: string,
   familyId: string,
   limit = 50
): Promise<IPayment[]> {
   await connectDB();
   await _validateAccess(familyId, 'read');

   if (!mongoose.isValidObjectId(childId)) {
      return [];
   }

   const payments = await Payment.find({ childId, familyId })
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();

   return payments.map((payment: any) => ({
      ...payment,
      _id: payment._id?.toString?.() ?? '',
      familyId: payment.familyId?.toString?.() ?? '',
      childId: payment.childId?.toString?.() ?? '',
      paymentDate: payment.paymentDate || '',
      notes: payment.notes || '',
      place: payment.place || '',
      paymentAmount: payment.paymentAmount || 0,
      previousBalance: payment.previousBalance ?? 0,
      createdAt: payment.createdAt?.toISOString?.() ?? null,
      updatedAt: payment.updatedAt?.toISOString?.() ?? null,
   }));
}

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
   await _validateAccess(familyId, 'create');

   if (!mongoose.isValidObjectId(childId)) {
      throw new Error('Invalid child ID');
   }

   const childBefore = await Child.findOneAndUpdate(
      { _id: childId, familyId },
      { $inc: { currentBalance: -paymentAmount } },
      { new: false }
   ).lean();

   if (!childBefore) {
      throw new Error('Child not found');
   }

   const previousBalance = childBefore.currentBalance ?? 0;
   const normalizedPaymentDate = paymentDate || new Date().toISOString().slice(0, 10);
   const payment = await Payment.create({
      childId,
      familyId,
      place,
      previousBalance,
      paymentAmount,
      notes: notes || '',
      paymentDate: normalizedPaymentDate,
   });

   return {
      ...payment.toObject(),
      _id: payment._id.toString(),
      familyId: payment.familyId?.toString?.() ?? '',
      childId: payment.childId?.toString?.() ?? '',
      createdAt: payment.createdAt?.toISOString?.() ?? null,
      updatedAt: payment.updatedAt?.toISOString?.() ?? null,
   };
}
