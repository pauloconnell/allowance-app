'use client';

import Link from 'next/link';
import type { IChore } from '@/types/IChore';

interface ChoreListProps {
  chores: IChore[];
  familyId: string;
  childId?: string; // optional filter
}

export default function ChoreList({ chores, familyId, childId }: ChoreListProps) {
  // Filter chores if a childId is provided
  const filtered = childId
    ? chores.filter((c) => c.childId === childId)
    : chores;

  if (!filtered || filtered.length === 0) {
    return (
      <p className="text-gray-500">
        {childId ? 'No chores assigned to this child.' : 'No chores created yet.'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((chore) => (
        <div
          key={chore._id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-2">{chore.taskName}</h3>

          <p className="text-gray-600 mb-1">
            Reward: ${chore.rewardAmount}
          </p>

          {chore.isRecurring && (
            <p className="text-gray-600 mb-1">
              Recurs every {chore.intervalDays} day{chore.intervalDays !== 1 ? 's' : ''}
            </p>
          )}

          {chore.suggestedTime && (
            <p className="text-gray-600 mb-1">
              Suggested Time: {chore.suggestedTime}
            </p>
          )}

          {chore.childId ? (
            <p className="text-gray-600 mb-4">
              Assigned to: {chore.childId}
            </p>
          ) : (
            <p className="text-gray-400 italic mb-4">
              Not assigned to any child
            </p>
          )}

          <Link
            href={`/protectedPages/${familyId}/chores/${chore._id}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  );
}
