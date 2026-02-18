'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalTodayString } from '@/lib/utils/dateHelper';

interface Props {
   familyId: string;
   childId: string;
}

export default function NewPenaltyForm({ familyId, childId }: Props) {
   const router = useRouter();

   const [amount, setAmount] = useState('');
   const [reason, setReason] = useState('');
   const [consequence, setConsequence] = useState(''); // can have money and/or consequence ie. no eletronics for 2 days
   const [duration, setDuration] = useState('1');
   const [endDate, setEndDate] = useState(() =>
      new Date().toISOString().substring(0, 10)
   ); // by default ends today(if just money we don't want it to repeat)
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const today = new Date().toLocaleDateString('en-CA'); // on client so can send actual local time

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError('');
      const amt = parseFloat(amount);
      if (!reason) {
         setError('Please provide a reason'); //TODO use toast here
         return;
      }
      console.log("date corrupt?", today);
      setLoading(true);
      try {
         const payload = {
            childId,
            familyId,
            date: today,
            penalty: {
               amount: amt,
               reason,
               consequence,
               date: today,
               endDate,
               status: 'active',
            },
         };

         const res = await fetch('/api/daily-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Failed to add penalty');
         }

         // refresh server data
         router.refresh();
         setAmount('');
         setReason('');
         setEndDate(new Date().toLocaleDateString('en-CA'));
      } catch (err: any) {
         setError(err?.message || 'Error adding penalty');
      } finally {
         setLoading(false);
      }
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
               type="number"
               step="0.01"
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
               placeholder="e.g. 5.00"
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <input
               type="text"
               value={reason}
               onChange={(e) => setReason(e.target.value)}
               className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
               placeholder="e.g. Broke a rule"
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700">
               Duration: Consequence in effect until: (optional)
            </label>
            <input
               type="date"
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
               className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700">Consequence</label>
            <input
               type="text"
               value={consequence}
               onChange={(e) => setConsequence(e.target.value)}
               className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
               placeholder="e.g. 1 day without electronics"
            />
         </div>

         {error && <div className="text-sm text-red-600">{error}</div>}

         <div className="flex items-center gap-3">
            <button
               type="submit"
               disabled={loading}
               className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
            >
               {loading ? 'Saving...' : 'Add Penalty'}
            </button>
         </div>
      </form>
   );
}
