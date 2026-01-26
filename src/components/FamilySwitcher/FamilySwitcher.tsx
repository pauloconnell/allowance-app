'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { IFamily } from '@/types/IFamily';
import { useState, useEffect } from 'react';
import { useFamilyStore } from '@/store/useCompanyStore';

interface FamilySwitcherProps {
   families: (IFamily & { role: string })[];
   activeFamilyId: string;
}

export default function FamilySwitcher({
   families,
   activeFamilyId,
}: FamilySwitcherProps) {
   const router = useRouter();
   const { setActiveFamilyId } = useFamilyStore();
   const [isOpen, setIsOpen] = useState(false);

   // Sync the URL-provided activeFamilyId into the Zustand store on mount or change
   useEffect(() => {
      if (activeFamilyId) {
         setActiveFamilyId(activeFamilyId);
      }
   }, [activeFamilyId, setActiveFamilyId]);

   const activeFamily = families.find((f) => f._id === activeFamilyId);

   function handleSwitch(familyId: string) {
      // 1. Update the global state
      setActiveFamilyId(familyId);

      // 2. Navigate to the dynamic route
      router.push(`/protectedPages/${familyId}/dashboard`);

      setIsOpen(false);
   }

   return (
      <div className="relative">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition duration-150"
         >
            {activeFamily?.name || 'Select Family'} ▼
         </button>

         {isOpen && (
            <div className="absolute top-full mt-2 w-full min-w-[200px] bg-white border border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden">
               {families.map((family) => (
                  <button
                     key={family._id}
                     onClick={() => handleSwitch(family._id)}
                     className={`w-full text-left px-6 py-3 hover:bg-gray-200 transition-colors ${
                        family._id === activeFamilyId
                           ? 'bg-gray-100 text-blue-600 font-bold'
                           : 'text-black font-medium'
                     }`}
                  >
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{family.name}</span>
                        <span className="text-xs text-gray-500">({family.role})</span>
                     </div>
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}
