'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recordPayment } from '@/lib/actions/payment';

interface Props {
   familyId: string;
   childId: string;
}

export default function NewPaymentForm({ familyId, childId }: Props) {
   const router = useRouter();
   const [place, setPlace] = useState('');
   const [paymentAmount, setPaymentAmount] = useState('');
   const [paymentDate, setPaymentDate] = useState(
      new Date().toISOString().substring(0, 10)
   );
   const [notes, setNotes] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setError('');

      const amount = parseFloat(paymentAmount);
      if (!place.trim()) {
         setError('Please enter a payment description or location.');
         return;
      }
      if (Number.isNaN(amount) || amount <= 0) {
         setError('Please enter a valid payment amount greater than zero.');
         return;
      }

      setLoading(true);
      try {
         await recordPayment({
            familyId,
            childId,
            place: place.trim(),
            paymentAmount: amount,
            paymentDate,
            notes: notes.trim(),
         });

         setPlace('');
         setPaymentAmount('');
         setNotes('');
         setPaymentDate(new Date().toISOString().substring(0, 10));
         router.refresh();
      } catch (err: any) {
         setError(err?.message || 'Unable to save payment');
      } finally {
         setLoading(false);
      }
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
            <label className="block text-sm font-medium text-gray-700">Payment Amount</label>
            <input
               type="number"
               step="0.01"
               min="0"
               value={paymentAmount}
               onChange={(event) => setPaymentAmount(event.target.value)}
               className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
               placeholder="e.g. 10.00"
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700">Source / Place</label>
            <input
               type="text"
               value={place}
               onChange={(event) => setPlace(event.target.value)}
               className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
               placeholder="e.g. Allowance, Chore payout, Birthday gift"
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700">Payment Date</label>
            <input
               type="date"
               value={paymentDate}
               onChange={(event) => setPaymentDate(event.target.value)}
               className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
               value={notes}
               onChange={(event) => setNotes(event.target.value)}
               className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
               rows={3}
               placeholder="e.g. Weekly allowance deposit"
            />
         </div>

         {error && <div className="text-sm text-red-600">{error}</div>}

         <div className="flex items-center gap-3">
            <button
               type="submit"
               disabled={loading}
               className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
            >
               {loading ? 'Saving...' : 'Record Payment'}
            </button>
         </div>
      </form>
   );
}
