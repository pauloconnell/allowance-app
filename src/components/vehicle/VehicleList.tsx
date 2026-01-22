'use client';
import Link from 'next/link';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useCompanyStore } from '@/store/useCompanyStore';
import { IVehicle } from '@/types/IVehicle';
import { useEffect } from 'react';

interface VehicleListProps {
   vehicles: IVehicle[];
   companyId: string;
}

export default function VehicleList({ vehicles, companyId }: VehicleListProps) {
   const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);
   // Get the current companyId from the store
   
const setActiveCompanyId = useCompanyStore((s) => s.setActiveCompanyId);
   useEffect(() => {
      if (companyId) setActiveCompanyId(companyId);
   }, [companyId, setActiveCompanyId]);

   if (!vehicles || vehicles.length === 0) {
      return <p className="text-gray-500">No vehicles yet.</p>;
   }

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {vehicles.map((v) => (
            <Link
               key={v._id}
               href={`/protectedPages/${companyId}/vehicles/${v._id}`}
               onClick={() => setSelectedVehicle(v)}
               className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
               <div className="font-medium">
                  {v.year} {v.make} {v.model}, Name: {v.nickName}
               </div>
            </Link>
         ))}
      </div>
   );
}
