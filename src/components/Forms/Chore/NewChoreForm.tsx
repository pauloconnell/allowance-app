'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { sanitizeInput } from '@/lib/utils/sanitizeInput';
import type { IChore } from '@/types/IChore';
import type { IFormChore } from '@/types/IFormChore';

interface ChoreFormProps {
   chore?: IChore | IFormChore;
   familyId: string;
}

export default function NewChoreForm({ chore, familyId }: ChoreFormProps) {
   const router = useRouter();
   const isEdit = !!chore;

   //const derivedChoreId = chore && '_id' in chore ? chore._id : (chore?.choreId ?? '');

   const [form, setForm] = useState({
      taskName: chore?.taskName ?? '',
      rewardAmount: chore?.rewardAmount ?? '',
      isRecurring: chore?.isRecurring ?? false,
      dueDate: chore?.dueDate
         ? new Date(chore.dueDate).toISOString().split('T')[0]
         : new Date().toISOString().split('T')[0],
      intervalDays: chore?.intervalDays ?? '',
      suggestedTime: chore?.suggestedTime ?? '', // If it's there, we're editing. If not, we're creating.
      choreId: chore?._id || '',
      familyId: familyId ?? '',
   });

   // // Sync form with incoming chore prop
   // useEffect(() => {
   //    if (!chore) return;
   //    setForm(prev =>({
   //       ...prev,
   //       taskName: chore.taskName ?? '',
   //       rewardAmount: chore.rewardAmount ?? '',
   //       isRecurring: chore.isRecurring ?? false,
   //       intervalDays: chore.intervalDays ?? '',
   //       suggestedTime: chore.suggestedTime ?? '',
   //       choreId: derivedChoreId,
   //       familyId: familyId ?? '',
   //    }));
   // }, [JSON.stringify(chore)]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, type, checked, value } = e.target;

      const cleaned = type === 'checkbox' ? checked : sanitizeInput(value);

      setForm({ ...form, [name]: cleaned });
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (isEdit && chore) {
         const savedChore = chore as IChore;

         const res = await fetch(`/api/chores/${savedChore._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, familyId }),
         });

         if (!res.ok) throw new Error('Failed to update chore');
         toast.success('Chore updated');

         router.push(`/protectedPages/${familyId}/chores/${savedChore._id}`);
         router.refresh();
      } else {
         const res = await fetch('/api/chores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, familyId }),
         });

         if (!res.ok) throw new Error('Failed to create chore');
         toast.success('Chore created');

         router.push(`/protectedPages/${familyId}/chores`);
         router.refresh();
      }
   };

   return (
      <form
         onSubmit={handleSubmit}
         className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
         <div>
            <label
               htmlFor="taskName"
               className="block text-sm font-medium text-gray-700 mb-2"
            >
               Task Name
            </label>
            <input
               type="text"
               id="taskName"
               name="taskName"
               value={form.taskName}
               onChange={handleChange}
               required
               className="w-full px-3 py-2 border border-gray-300 rounded-md"
               placeholder="e.g., Make bed, Take out trash"
            />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
               <label htmlFor="isRecurring">
                  <input
                     type="checkbox"
                     name="isRecurring"
                     checked={form.isRecurring}
                     onChange={handleChange}
                     className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                     Recurring Chore
                  </span>
               </label>
            </div>
       

          
         </div>
         {form.isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label
                     htmlFor="dueDate"
                     className="block text-sm font-medium text-gray-700 mb-2"
                  >
                     Due Date
                  </label>
                  <input
                     type="date"
                     id="dueDate"
                     name="dueDate"
                     value={form.dueDate}
                     onChange={handleChange}
                     required={!form.isRecurring} // Optional: maybe only required if not recurring?
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
               </div>
               <div>
                  <label
                     htmlFor="intervalDays"
                     className="block text-sm font-medium text-gray-700 mb-2"
                  >
                     Repeat Every (days)
                  </label>
                  <input
                     type="number"
                     id="intervalDays"
                     name="intervalDays"
                     value={form.intervalDays}
                     onChange={handleChange}
                     min="1"
                     className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        !form.isRecurring ? 'bg-gray-100 cursor-not-allowed' : ''
                     }`}
                     placeholder="1 for daily, 7 for weekly"
                     disabled={!form.isRecurring}
                  />
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Reward Amount */}
     <div>
               <label
                  htmlFor="rewardAmount"
                  className="block text-sm font-medium text-gray-700 mb-2"
               >
                  Reward Amount ($)
               </label>
               <input
                  type="number"
                  id="rewardAmount"
                  name="rewardAmount"
                  value={form.rewardAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.05"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
               />
            </div>
            {/* Column 2: Suggested Time */}
            <div>
               <label
                  htmlFor="suggestedTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
               >
                  Suggested Time (optional)
               </label>
               <input
                  type="time"
                  id="suggestedTime"
                  name="suggestedTime"
                  value={form.suggestedTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
               />
            </div>
         </div>
         <div className="flex justify-between items-center mt-6">
            <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
               {isEdit ? 'Save Changes' : 'Create Chore'}
            </button>

            <button
               type="button"
               onClick={() => router.back()}
               className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
               Cancel
            </button>
         </div>

         <div>
            {/* Remove after dev */}
            <pre className="text-xs bg-gray-100 p-2 rounded">
               {JSON.stringify(form, null, 2)}
            </pre>
         </div>
      </form>
   );
}
