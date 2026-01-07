'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VehicleFormProps {
   vehicle?: {
      year: number | string;
      make: string;
      model: string;
      name: string;
      mileage: number | string;
      vin: string;
      _id?: string;
      vehicleId: string
   };

}

export default function VehicleForm({ vehicle }: VehicleFormProps) {
   const router = useRouter();

   const isEdit = !!vehicle;    //is in edit mode if we have been passed a vehicle

   const derivedVehicleId = vehicle?.vehicleId ?? vehicle?._id?.toString() ?? "";   // vehicleId comes from the _id, but new vehicles will not have this until mongodb assigns it

   const [form, setForm] = useState({
      year: vehicle?.year ?? '',
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      name: vehicle?.name ?? '',
      mileage: vehicle?.mileage ?? '',
      vin: vehicle?.vin ?? '',
      vehicleId: derivedVehicleId,
   });

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (isEdit) {
         // UPDATE existing vehicle
         await fetch(`/api/vehicles/${vehicle._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
         });
         router.push(`/protectedPages/vehicles/${vehicle._id}`);
         router.refresh();
      } else {
         // CREATE new vehicle
         await fetch('/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
         });
         router.push('/protectedPages/dashboard');
         router.refresh();
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <input
            name="year"
            value={form.year}
            onChange={handleChange}
            placeholder="Year"
            className="border px-3 py-2 rounded w-full"
         />

         <input
            name="make"
            value={form.make}
            onChange={handleChange}
            placeholder="Make"
            className="border px-3 py-2 rounded w-full"
         />

         <input
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="Model"
            className="border px-3 py-2 rounded w-full"
         />

         <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="border px-3 py-2 rounded w-full"
         />

         <input
            name="mileage"
            value={form.mileage}
            onChange={handleChange}
            placeholder="Mileage"
            className="border px-3 py-2 rounded w-full"
         />

         <input
            name="vin"
            value={form.vin}
            onChange={handleChange}
            placeholder="VIN"
            className="border px-3 py-2 rounded w-full"
         />
         <div className="flex justify-between items-center mt-6 px-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
               Save Vehicle
            </button>
            <button
               type="button"
               onClick={() => router.back()}
               className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
               Cancel
            </button>
         </div>
      </form>
   );
}
