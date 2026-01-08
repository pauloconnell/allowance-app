'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SharedServiceFormFields from '../Shared/SharedServiceFormFields';
import DeleteWorkOrderButton from '@/components/Buttons/DeleteWorkOrderButton';
import { toast } from 'react-hot-toast';

export default function WorkOrderForm({ prefill, vehicles }) {
   const router = useRouter();

   const [form, setForm] = useState({
      workOrderId: prefill?.workOrderId ? prefill.workOrderId.toString() : '',
      vehicleId: prefill.vehicleId ?? '',
      serviceType: prefill?.serviceType ?? '',
      serviceDueDate: prefill.serviceDueDate || '',
      serviceDueKM: prefill.serviceDueKM || '',
      mileage: prefill.mileage ?? '',
      location: prefill.location?.split(',') ?? ['N/A'],
      notes: prefill.notes ?? '',
   });
  

   console.log('does prefill have notes:', form.notes, prefill);
   const serviceTypes = [
      'Oil Change',
      'Air Filter Replacement',
      'Tire Rotation',
      'Tire Replacement',
      'Brake Caliper Service',
      'Brake Pads Replace',
      'Brake Fluid bleed',
      'Belt Change',
      'Power Steering Fluid Flush',
      'Coolant Flush',
      'Transmission Service',
      'Inspection',
      'Electrical work(see notes)',
      'Other',
   ];
   const locations = [
      { value: 'front', label: 'Front' },
      { value: 'rear', label: 'Rear' },
      { value: 'fr', label: 'Front Right (FR)' },
      { value: 'fl', label: 'Front Left (FL)' },
      { value: 'rr', label: 'Rear Right (RR)' },
      { value: 'rl', label: 'Rear Left (RL)' },
      { value: 'N/A', label: 'N/A' },
   ];

   function handleChange(e) {
      const { name, value, type } = e.target;
      setForm({ ...form, [name]: type === 'number' ? Number(value) : value });
   }

   async function handleSubmit(e) {
      e.preventDefault();
      console.log('submitted to API:', form);

      const isEditing = Boolean(form.workOrderId);    // allow updates when viewing work order(add notes ect)
      const url = isEditing ? `/api/work-orders/${form.workOrderId}` : `/api/work-orders`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(form),
      });

      // const res = await fetch('/api/work-orders', {
      //    method: 'POST',
      //    headers: { 'Content-Type': 'application/json' },
      //    body: JSON.stringify(form),
      // });

      if (res.ok) {
         toast.success('Work order saved');
         router.push(`/protectedPages/vehicles/${form.vehicleId}`);
      } else {
         toast.error('Failed to save work order');
         alert('Failed to save work order');
      }
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="bg-white p-6 rounded-lg shadow-sm border space-y-6"
      >
         <SharedServiceFormFields
            form={form}
            setForm={setForm}
            vehicles={vehicles}
            serviceTypes={serviceTypes}
            locations={locations}
            handleChange={handleChange}
         />

         {/* Work Order specific fields */}
         <div className="flex flex-col md:flex-row gap-4">
            <label className="flex flex-col flex-1">
               Service Due Date
               <input
                  type="date"
                  name="serviceDueDate"
                  value={form.serviceDueDate}
                  onChange={handleChange}
                  className="border rounded-full px-4 py-2"
               />
            </label>

            <label className="flex flex-col flex-1">
               Service Due KM
               <input
                  type="number"
                  name="serviceDueKM"
                  value={form.serviceDueKM}
                  onChange={handleChange}
                  className="border rounded-full px-4 py-2"
               />
            </label>
         </div>

         {/* Submit + Delete */}
         <div className="flex justify-between items-center mt-6 px-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
               Save Work Order
            </button>

            {prefill.workOrderId && (
               
               <DeleteWorkOrderButton workOrderId={prefill.workOrderId} />
            )}
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
