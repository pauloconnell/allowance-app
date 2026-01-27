'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { sanitizeInput } from '@/lib/utils/sanitizeInput';
import type { IVehicle } from '@/types/IVehicle';
import type { IFormVehicle } from '@/types/IFormVehicle';

interface VehicleFormProps {
   vehicle?: IVehicle | IFormVehicle;
   familyId?: string;
}

export default function VehicleForm({ vehicle, familyId }: VehicleFormProps) {
   const router = useRouter();

   const isEdit = !!vehicle;

   const derivedVehicleId = (vehicle && '_id' in vehicle) ? vehicle._id : (vehicle?.vehicleId ?? '');
   const [form, setForm] = useState({
      year: vehicle?.year ?? '',
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      nickName: vehicle?.nickName ?? '',
      mileage: vehicle?.mileage ?? '',
      vin: vehicle?.vin ?? '',
      vehicleId: derivedVehicleId,
      familyId: familyId ?? '',
   });

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = sanitizeInput(e.target.value);
      setForm({ ...form, [e.target.name]: cleaned });
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isEdit && vehicle) {
         const savedVehicle = vehicle as IVehicle;
         // UPDATE existing vehicle
         let res = await fetch(`/api/vehicles/${savedVehicle._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, familyId }),
         });

         if (!res.ok) throw new Error('Failed to update vehicle');
         toast.success('Vehicle updated');

         router.push(`/protectedPages/${familyId}/vehicles/${savedVehicle._id}`);
         router.refresh();
      } else {
         // CREATE new vehicle
         let res = await fetch('/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, familyId }),
         });

         if (!res.ok) throw new Error('Failed to create vehicle');
         toast.success('Vehicle created');

         router.push(`/protectedPages/${familyId}/dashboard`);
         router.refresh();
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
            <label
               htmlFor="year"
               className="block text-sm font-medium text-gray-700 mb-1"
            >
               Year
            </label>
            <input
               id="year"
               name="year"
               value={form.year}
               onChange={handleChange}
               placeholder="Year"
               className="border px-3 py-2 rounded w-full"
               required
            />
         </div>

         <div>
            <label
               htmlFor="make"
               className="block text-sm font-medium text-gray-700 mb-1"
            >
               Make
            </label>
            <input
               id="make"
               name="make"
               value={form.make}
               onChange={handleChange}
               placeholder="Make"
               className="border px-3 py-2 rounded w-full"
               required
            />
         </div>

         <div>
            <label
               htmlFor="model"
               className="block text-sm font-medium text-gray-700 mb-1"
            >
               Model
            </label>
            <input
               id="model"
               name="model"
               value={form.model}
               onChange={handleChange}
               placeholder="Model"
               className="border px-3 py-2 rounded w-full"
               required
            />
         </div>

         <div>
            <label
               htmlFor="nickName"
               className="block text-sm font-medium text-gray-700 mb-1"
            >
               Vehicle Nickname
            </label>
            <input
               id="name"
               name="nickName"
               value={form.nickName}
               onChange={handleChange}
               placeholder="Nick Name"
               className="border px-3 py-2 rounded w-full"
               required
            />
         </div>

         <div>
            <label
               htmlFor="mileage"
               className="block text-sm font-medium text-gray-700 mb-1"
            >
               Mileage
            </label>
            <input
               id="mileage"
               name="mileage"
               value={form.mileage}
               onChange={handleChange}
               placeholder="Mileage"
               className="border px-3 py-2 rounded w-full"
            />
         </div>

         <div>
            <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
               VIN
            </label>
            <input
               id="vin"
               name="vin"
               value={form.vin}
               onChange={handleChange}
               placeholder="VIN"
               className="border px-3 py-2 rounded w-full"
            />
         </div>

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

         <div>
            delete this once dev is done: <pre>{JSON.stringify(form, null, 2)}</pre>
         </div>
      </form>
   );
}
