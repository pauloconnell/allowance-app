'use client';
import Link from 'next/link';
import { useChildStore } from '@/store/useVehicleStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { IVehicle } from '@/types/IVehicle';
import { useEffect } from 'react';

interface ChildListProps {
   children: IVehicle[];
   familyId: string;
}

export default function ChildList({ children, familyId }: ChildListProps) {
   const setSelectedChild = useChildStore((s) => s.setSelectedChild);
   // Get the current familyId from the store
   
const setActiveFamilyId = useFamilyStore((s) => s.setActiveFamilyId);
   useEffect(() => {
      if (familyId) setActiveFamilyId(familyId);
   }, [familyId, setActiveFamilyId]);

   if (!children || children.length === 0) {
      return <p className="text-gray-500">No children yet.</p>;
   }

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {children.map((c) => (
            <Link
               key={c._id}
               href={`/protectedPages/${familyId}/children/${c._id}`}
               onClick={() => setSelectedChild(c)}
               className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
               <div className="font-medium">
                  {c.year} {c.make} {c.model}, Name: {c.nickName}
               </div>
            </Link>
         ))}
      </div>
   );
}
