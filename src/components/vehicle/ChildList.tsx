'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import type { IChild } from '@/types/IChild';

interface ChildListProps {
   children: IChild[];
   familyId: string;
}

export default function ChildList({ children, familyId }: ChildListProps) {
   const setActiveFamilyId = useFamilyStore((s) => s.setActiveFamilyId);
   const setActiveChildId = useFamilyStore((s) => s.setActiveChildId);

   useEffect(() => {
      if (familyId) setActiveFamilyId(familyId);
   }, [familyId, setActiveFamilyId]);

   if (!children || children.length === 0) {
      return <p className="text-gray-500">No children yet.</p>;
   }

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {children.map((child) => (
            <Link
               key={child._id}
               href={`/protectedPages/${familyId}/children/${child._id}`}
               onClick={() => setActiveChildId(child._id)}
               className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
               <div className="flex items-center gap-3">
                  {child.avatarUrl && (
                     <img
                        src={child.avatarUrl}
                        alt={child.name}
                        className="w-12 h-12 rounded-full object-cover"
                     />
                  )}

                  <div>
                   
                     <div className="font-semibold">{child.name}</div>
                     <div className="text-sm text-gray-600">Age: {child.age}</div>
                  </div>
               </div>
            </Link>
         ))}
      </div>
   );
}
