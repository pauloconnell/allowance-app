'use client';

import Link from 'next/link';
import type { IChild } from '@/types/IChild';
import { toast } from "react-hot-toast";
import { useEffect } from 'react';

interface ChildrenListProps {
  children: IChild[];           // use props instead of store as component is only used on pages where it gets data directly in props
  familyId: string;
  errorMessage?: string;
}

export default function ChildrenList({ children, familyId, errorMessage}: ChildrenListProps) {    
  
  useEffect(() => {                   // the errorMessage is thrown if server fails to get children data -> but zustand could still already have data and user can just carry
    if (errorMessage && errorMessage.length > 0){
      toast.error(errorMessage, {
        id: 'child-fetch-error', // Unique ID prevents duplicates
        duration: 4000,          // Stays for 4 seconds
      });
    }
  }, [errorMessage]);

  
  
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
