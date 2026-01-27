'use client';

import Link from 'next/link';
import type { IChild } from '@/types/IChild';

interface ChildrenListProps {
  children: IChild[];
  familyId: string;
}

export default function ChildrenList({ children, familyId }: ChildrenListProps) {
  if (!children || children.length === 0) {
    return <p className="text-gray-500">No children found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children.map((child) => (
        <div
          key={child._id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-2">{child.name}</h3>

          <p className="text-gray-600 mb-2">Age: {child.age}</p>

          {typeof child.currentBalance !== 'undefined' && (
            <p className="text-gray-600 mb-4">
              Balance: ${child.currentBalance}
            </p>
          )}

          <Link
            href={`/protectedPages/${familyId}/children/${child._id}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  );
}
