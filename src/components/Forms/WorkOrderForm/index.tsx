'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SharedServiceFormFields from '../Shared/SharedServiceFormFields';
import DeleteWorkOrderButton from '@/components/Buttons/DeleteWorkOrderButton';
import { toast } from 'react-hot-toast';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';

export default function WorkOrderForm({ workOrderId, vehicles }) {
   const router = useRouter();
   const storeWO = useWorkOrderStore((s) => s.selectedWorkOrder);
   const fetchWorkOrder = useWorkOrderStore((s) => s.fetchWorkOrder);


   console.log('vehicleId issue?', storeWO);
   const [form, setForm] = useState({
      workOrderId: workOrderId.toString(),
      vehicleId: storeWO?.vehicleId ?? '',
      serviceType: storeWO?.serviceType ?? '',
      serviceDueDate: storeWO?.serviceDueDate ? storeWO.serviceDueDate.split('T')[0] : '',
      serviceDueKM: storeWO?.serviceDueKM ?? '',
      mileage: storeWO?.mileage ?? '',
      location: storeWO?.location ?? ['N/A'],
      notes: storeWO?.notes ?? '',
      completedBy: storeWO?.completedBy ?? '',
   });


   // Fetch on refresh
   useEffect(() => {
      // If store is empty OR store has a different workOrderId, fetch it
      if (!storeWO || storeWO._id !== workOrderId) {
         fetchWorkOrder(workOrderId);
      }
   }, [storeWO, workOrderId, fetchWorkOrder]);

   
   useEffect(() => {
      if (storeWO) {
         setForm({
            workOrderId: workOrderId.toString(),
            vehicleId: storeWO.vehicleId ?? '',
            serviceType: storeWO.serviceType ?? '',
            serviceDueDate: storeWO.serviceDueDate
               ? storeWO.serviceDueDate.split('T')[0]
               : '',
            serviceDueKM: storeWO.serviceDueKM ?? '',
            mileage: storeWO.mileage ?? '',
            location: storeWO.location ?? ['N/A'],
            notes: storeWO.notes ?? '',
            completedBy: storeWO.completedBy ?? '',
         });
      }
   }, [storeWO, workOrderId]);



   // Build a plain prefill object from searchParams OR Zustand Store
   if (!storeWO) {
      return <div>Loading…</div>;
   }
   const isEditing = Boolean(form.workOrderId);
   // allow updates when viewing work order(add notes ect)

   console.log('does prefill have notes:', form.notes);
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

   // handle complete will complete a work order to mark it done:
   const handleComplete = async () => {
      const res = await fetch(`/api/work-orders/${form.workOrderId}/complete`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ completedBy: form.completedBy }),
      });

      const data = await res.json();

      toast.success('Work order completed');

      router.push(`/protectedPages/vehicles/${form.vehicleId}`);
      router.refresh();
   };

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
         {/* If existing work order: allow user to Complete work order - must add tech's name */}
         {isEditing && (
            <div className="space-y-2 mt-6">
               <label className="block text-sm font-medium text-gray-700">
                  Completed By (Technician)
               </label>
               <input
                  type="text"
                  name="completedBy"
                  value={form.completedBy || ''}
                  onChange={handleChange}
                  placeholder="Technician Name"
                  className="border px-3 py-2 rounded w-full"
               />{' '}
               <button
                  type="button"
                  onClick={handleComplete}
                  disabled={!form.completedBy}
                  className={`px-4 py-2 rounded text-white ${
                     form.completedBy
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                  }`}
               >
                  {' '}
                  Mark Work Order as Completed{' '}
               </button>{' '}
            </div>
         )}

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

            {workOrderId && <DeleteWorkOrderButton workOrderId={workOrderId} />}
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
