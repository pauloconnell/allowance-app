// components/ChoreItem.tsx
'use client';
import { useTransition, useState, useEffect } from 'react';
import { updateChoreStatus } from '@/lib/actions/record';

// Notice we use recordId (string) because it's serializable
// and we removed onUpdate because a Server Page can't pass it.
export default function ChoreCompletionBoxes({
   chore,
   recordId,
   isDisabled,
}: {
   chore: any;
   recordId: string;
   isDisabled?: boolean;
}) {
   const [isPending, startTransition] = useTransition();

   const [localStatus, setLocalStatus] = useState(chore.completionStatus);

   // update the local state to match the fresh prop.
   useEffect(() => {
      // Only let the server/cache overwrite our local UI if we have a real connection
      // or if the component is mounting for the first time.
      if (navigator.onLine) {
         setLocalStatus(chore.completionStatus);
      }
   }, [chore.completionStatus]);

   const handleToggle = (val: number) => {
      // Prevent redundant clicks
      if (val === localStatus) return;

      // OPTIMISTIC UPDATE: Change UI immediately
      setLocalStatus(val);

      startTransition(async () => {
         // Direct call to the Server Action
         try {
            await updateChoreStatus(recordId, chore._id, val);
         } catch (err) {
            // If we're offline, the SW returns 503, which throws an error here.
            // Instead of crashing, we just force a refresh to show the cached data.
            if (!navigator.onLine) {
               //    window.location.reload();
               return; // error because we are offline - leave it
            }
            // 4. ROLLBACK: If it's a real error (not offline), revert UI
            setLocalStatus(chore.completionStatus);
            console.error('Actual error:', err);
         }
      });
   };

   const options = [
      { label: '0%', value: 0, color: 'bg-red-100 text-red-700' },
      { label: '50%', value: 0.5, color: 'bg-orange-100 text-orange-700' },
      { label: '100%', value: 1, color: 'bg-green-100 text-green-700' },
   ];

   return (
      <div
         className={`mt-4 p-2 rounded-md transition-all ${isPending ? 'bg-gray-50 opacity-60' : ''}`}
      >
         <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
               {isDisabled ? 'Child selected: ' : 'Update Progress'}
            </span>
            {isPending && (
               <span className="text-xs text-blue-600 animate-pulse font-medium">
                  Saving to DB...
               </span>
            )}
         </div>

         <div className="flex gap-2">
            {options.map((opt) => (
               <button
                  key={opt.value}
                  disabled={isPending || isDisabled}
                  onClick={() => handleToggle(opt.value)}
                  className={`flex-1 py-2 rounded-md border text-sm transition-all
              ${
                 localStatus === opt.value
                    ? `${opt.color} border-current font-bold ring-2 ring-offset-1 ring-blue-400`
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
              } ${isPending || isDisabled ? 'cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
               >
                  {opt.label}
               </button>
            ))}
         </div>
      </div>
   );
}
