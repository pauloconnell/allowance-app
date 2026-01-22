'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ICompany } from '@/types/ICompany';
import { useState } from 'react';

interface CompanySwitcherProps {
   companies: (ICompany & { role: string })[];
   activeCompanyId: string;
}

export default function CompanySwitcher({ companies, activeCompanyId }: CompanySwitcherProps) {
   const router = useRouter();
   const searchParams = useSearchParams();
   const [isOpen, setIsOpen] = useState(false);

   if (companies.length <= 1) {
      return null; // Don't show switcher if only one company
   }

   const activeCompany = companies.find((c) => c._id === activeCompanyId);

   function handleSwitch(companyId: string) {
      // Get current path and add/update companyId param
      const params = new URLSearchParams(searchParams);
      params.set('companyId', companyId);
      router.push(`?${params.toString()}`);
      setIsOpen(false);
   }

   return (
      <div className="relative">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-900"
         >
            {activeCompany?.name || 'Select Company'} ▼
         </button>

         {isOpen && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
               {companies.map((company) => (
                  <button
                     key={company._id}
                     onClick={() => handleSwitch(company._id)}
                     className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        company._id === activeCompanyId ? 'bg-blue-50 text-blue-600 font-medium' : ''
                     }`}
                  >
                     <div className="flex justify-between items-center">
                        <span>{company.name}</span>
                        <span className="text-xs text-gray-500">({company.role})</span>
                     </div>
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}
