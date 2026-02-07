'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyStore } from '@/store/useFamilyStore';


export default function ChildDropdown({ familyId, currentChildId }: { familyId: string, currentChildId?: string }) {
  const router = useRouter();
  const { children, childrenLoading } = useFamilyStore();



  return (
    <div className="flex flex-col">
        
      <select 
        disabled={childrenLoading}
        value={currentChildId || ""}
        onChange={(e) => {
          const id = e.target.value;
          router.push(id ? `/protectedPages/${familyId}/chores?childId=${id}` : `/protectedPages/${familyId}/chores`);
        }}
        className="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
      >
        <option value="">{childrenLoading ? 'Loading...' : 'Select Child Assignment'}</option>
        {children? children.map((c) => (
          <option  key={c._id} value={c._id}>
            {c.name}
          </option>
        )): "no Children Found"}
      </select>
    </div>
  );
}