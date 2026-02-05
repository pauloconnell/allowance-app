'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { IChore } from '@/types/IChore';
import type { IChild, IChildChore } from '@/types/IChild';

interface ChoreManagementListProps {
  allChores: IChore[];
  child: IChild;
  familyId: string;
}

export default function ChoreManagementList({ allChores, child, familyId }: ChoreManagementListProps) {
  const router = useRouter();

  // Create lookup for IDs already in the child's choresList
  const assignedIds = new Set(
    (child.choresList || []).map((c: IChildChore) => c.choreId?.toString())
  );

  // Partition the master pool into two lists
  const assignedChores = allChores.filter((ch) => assignedIds.has(ch._id as string));
  const availablePool = allChores.filter((ch) => !assignedIds.has(ch._id as string));

  const handleToggle = async (choreId: string, isCurrentlyAssigned: boolean) => {   // drilled down 2 levels to choreToggleCard @ bottom of this file
    const action = isCurrentlyAssigned ? 'remove' : 'assign';
    
    try {
      const res = await fetch(`/api/children/${child._id}/toggle-chore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choreId, action, familyId }),
      });

      if (!res.ok) throw new Error('Network response was not ok');
      
      toast.success(action === 'assign' ? `Assigned to ${child.name}` : 'Assignment Removed');
      router.refresh(); 
    } catch (err) {
      toast.error("Could not update assignment. Check console.");
      console.error("Toggle Error:", err);
    }
  };

  return (
    <div className="space-y-12">
      {/* Pool 1: What the child is currently doing */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h2 className="text-xl font-bold text-gray-800">Currently Active</h2>
          <span className="bg-gray-200 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {assignedChores.length}
          </span>
        </div>
        
        {assignedChores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedChores.map((chore) => (
              <ChoreToggleCard 
                key={chore._id as string} 
                chore={chore} 
                isAssigned={true} 
                onToggle={handleToggle} 
              />
            ))}
          </div>
        ) : (
          <div className="p-10 bg-white border border-dashed border-gray-300 rounded-xl text-center">
            <p className="text-gray-400">No chores assigned. Choose from the pool below to get started!</p>
          </div>
        )}
      </section>

      {/* Pool 2: The rest of the library */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </span>
          <h2 className="text-xl font-bold text-gray-800">Available Chore Library</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePool.map((chore) => (
            <ChoreToggleCard 
              key={chore._id as string} 
              chore={chore} 
              isAssigned={false} 
              onToggle={handleToggle} 
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface CardProps {
  chore: IChore;
  isAssigned: boolean;
  onToggle: (id: string, current: boolean) => Promise<void>;
}

function ChoreToggleCard({ chore, isAssigned, onToggle }: CardProps) {
  return (
    <label className={`
      relative flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-200
      ${isAssigned 
        ? 'bg-white border-green-500 shadow-md ring-1 ring-green-500/20' 
        : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-lg'}
    `}>
      <div className="flex flex-col pr-8">
        <span className="font-bold text-gray-900 text-lg mb-1">{chore.taskName}</span>
        <div className="flex items-center gap-2">
           <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-sm font-bold">
             ${chore.rewardAmount}
           </span>
           {chore.isRecurring && (
             <span className="text-xs text-gray-400 font-medium">Recurring</span>
           )}
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <input 
          type="checkbox" 
          checked={isAssigned}
          onChange={() => onToggle(chore._id as string, isAssigned)}
          className="h-6 w-6 rounded-full border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      </div>
    </label>
  );
}