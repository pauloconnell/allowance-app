'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { IFamily } from '@/types/IFamily';
import { useState, useEffect } from 'react';
import { useFamilyStore } from '@/store/useCompanyStore';

interface CompanySwitcherProps {
   companies: (IFamily & { role: string })[];
   activeCompanyId: string;
}

export default function CompanySwitcher({
   companies,
   activeCompanyId,
}: CompanySwitcherProps) {
   const router = useRouter();
   //const searchParams = useSearchParams();
   const { setActiveFamilyId } = useFamilyStore();
   const [isOpen, setIsOpen] = useState(false);

   // Sync the URL-provided activeCompanyId into the Zustand store on mount or change
   useEffect(() => {
      if (activeCompanyId) {
         setActiveFamilyId(activeCompanyId);
      }
   }, [activeCompanyId, setActiveFamilyId]);

   // if (companies.length <= 1) {
   //    return null; // Don't show switcher if only one company
   // }

   const activeCompany = companies.find((c) => c._id === activeCompanyId);

   function handleSwitch(companyId: string) {
      // 1. Update the global state
      setActiveFamilyId(companyId);

      // 2. Navigate to the dynamic route
      router.push(`/protectedPages/${companyId}/dashboard`);

      setIsOpen(false);
   }

   return (
      <div className="relative">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition duration-150"
         >
            {activeCompany?.name || 'Select Company'} ▼
         </button>

         {isOpen && (
            <div className="absolute top-full mt-2 w-full min-w-[200px] bg-white border border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden">
               {companies.map((company) => (
                  <button
                     key={company._id}
                     onClick={() => handleSwitch(company._id)}
                     className={`w-full text-left px-6 py-3 hover:bg-gray-200 transition-colors ${
                        company._id === activeCompanyId
                           ? 'bg-gray-100 text-blue-600 font-bold'
                           : 'text-black font-medium'
                     }`}
                  >
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{company.name}</span>
                        <span className="text-xs text-gray-500">({company.role})</span>
                     </div>
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}
