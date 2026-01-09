'use client'
import Link from 'next/link';
import { useVehicleStore } from "@/store/useVehicleStore";



interface Vehicle {
   _id: string;
   year: number;
   make: string;
   model: string;
   name: string;
   mileage: number;
}
interface VehicleListProps {
   vehicles: Vehicle[];
}

export default function VehicleList({ vehicles }: VehicleListProps) {

const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);

   if (!vehicles || vehicles.length === 0) {
      return <p className="text-gray-500">No vehicles yet.</p>;
   }

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {vehicles.map((v) => (
            <Link
               key={v._id}
               href={`/protectedPages/vehicles/${v._id}`}
               onClick={() => setSelectedVehicle(v)}
               className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
               <div className="font-medium">
                  {v.year} {v.make} {v.model}, Name: {v.name}
               </div>
            </Link>
         ))}
      </div>
   );
}
