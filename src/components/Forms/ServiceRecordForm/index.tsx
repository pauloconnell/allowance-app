'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SharedServiceFormFields from '../Shared/SharedServiceFormFields';
import { useChildStore } from '@/store/useVehicleStore';
import { sanitizeInput } from '@/lib/utils/sanitizeInput';
import type { IFormServiceRecord } from '@/types/IFormServiceRecord';

export default function ServiceRecordForm({ familyId, childId }: { familyId: string; childId?: string }) {
   const router = useRouter();

   // Zustand
   const children = useChildStore((s) => s.allChildren);
   const fetchAllChildren = useChildStore((s) => s.fetchAllChildren);
   const selectedChild = useChildStore((s) => s.selectedChild);
   const fetchChild = useChildStore((s) => s.fetchChild); // Fetch all children if not loaded (dashboard mode)


      // Form state
   const [form, setForm] = useState<IFormServiceRecord>({
      familyId: familyId,
      vehicleId: childId || '',
      serviceType: '',
      serviceDate: new Date().toISOString().split('T')[0],
      mileage: '',
      location: ['N/A'],
      notes: '',
      completedBy: '',
      isRecurring: false,
      serviceFrequencyKM: '',
      serviceFrequencyWeeks: '',
   });


   // Load all children (dashboard mode)

   // if no childId, get all children into store
   useEffect(() => {
      if (!children.length) {
         fetchAllChildren(familyId);
      }
   }, [children, fetchAllChildren]);


   //  Load selected child (detail mode)

   // Fetch selected child if childId provided
   useEffect(() => {
      // Guard against undefined/null childId
      if (!childId) return;
      // If no selectedChild OR wrong selectedChild, fetch it
      if (!selectedChild || selectedChild._id !== childId) {
         fetchChild(childId);   // this sets selectedChild in store
      }
   }, [childId, selectedChild, fetchChild]);

   
   // Hydrate form when selectedChild loads
   useEffect(() => {
      if (!selectedChild) return;
      setForm((prev) => ({
         ...prev,
         vehicleId: prev.vehicleId || selectedChild._id,
         nickName: selectedChild.nickName,
         mileage: String(selectedChild.mileage ?? ''),
      }));
   }, [selectedChild]);



   function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
      const { name, value } = e.target;

      // Special case: child selection
      if (name === 'vehicleId') {
         const c = children.find((child) => child._id === value);
         setForm((prev) => ({
            ...prev,
            vehicleId: value,
            nickName: c?.nickName ?? prev.nickName, //|| '', // REQUIRED by WorkOrder schema
            mileage: String(c?.mileage ?? prev.mileage), // set mileage to last known
         }));
         return;
      }

      // sanitize input (prevent XXS)-throws toast to warn user
      const cleaned = sanitizeInput(value);

      // Generic update
      setForm((prev) => ({ ...prev, [name]: cleaned }));
   }

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      console.log('about to save ', form);
      const res = await fetch('/api/service-records', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(form),
      });

      if (res.ok) {
         router.push(`/protectedPages/${familyId}/vehicles/${form.vehicleId}`);
      } else {
         alert('Failed to save record');
      }
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="bg-white p-6 rounded-lg shadow-sm border space-y-6"
      >
         <SharedServiceFormFields<IFormServiceRecord>
            form={form}
            setForm={setForm}
            vehicles={vehicles}
            handleChange={handleChange}
         />

         <div className="flex flex-col md:flex-row gap-4">
            {/* Service Record specific field */}
            <label className="flex flex-col flex-1">
               Date Service Performed
               <input
                  type="date"
                  name="serviceDate"
                  value={form.serviceDate}
                  onChange={handleChange}
                  className="border rounded px-4 py-2"
                  required
               />
            </label>
            <label className="flex flex-col flex-1">
               Completed By (Technician)
               <input
                  type="text"
                  name="completedBy"
                  value={form.completedBy || ''}
                  onChange={handleChange}
                  placeholder="Technician Name"
                  className="border px-3 py-2 rounded w-full"
                  required
               />
            </label>
         </div>

         {/* Submit */}
         <div className="flex justify-between items-center mt-6 px-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
               Save Service Record
            </button>

            <button
               type="button"
               onClick={() => router.back()}
               className="bg-gray-200 px-4 py-2 rounded-lg"
            >
               Cancel
            </button>
         </div>
      </form>
   );
}
