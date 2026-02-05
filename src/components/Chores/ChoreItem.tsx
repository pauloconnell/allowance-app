// components/ChoreItem.tsx
'use client';
import { useTransition } from 'react';
import { updateChoreStatus } from '@/lib/actions/record';

// Notice we use recordId (string) because it's serializable 
// and we removed onUpdate because a Server Page can't pass it.
export default function ChoreItem({ chore, recordId }: { chore: any, recordId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (val: number) => {
    // Prevent redundant clicks
    if (val === chore.completionStatus) return;
    
    startTransition(async () => {
      // Direct call to the Server Action
      const result = await updateChoreStatus(recordId, chore._id, val);
      
      if (result?.error) {
        alert("Sync failed: " + result.error);
      }
    });
  };

  const options = [
    { label: '0%', value: 0, color: 'bg-red-100 text-red-700' },
    { label: '50%', value: 0.5, color: 'bg-orange-100 text-orange-700' },
    { label: '100%', value: 1, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className={`mt-4 p-2 rounded-md transition-all ${isPending ? 'bg-gray-50 opacity-60' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Update Progress
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
            disabled={isPending}
            onClick={() => handleToggle(opt.value)}
            className={`flex-1 py-2 rounded-md border text-sm transition-all
              ${chore.completionStatus === opt.value 
                ? `${opt.color} border-current font-bold ring-2 ring-offset-1 ring-blue-400` 
                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
              } ${isPending ? 'cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}