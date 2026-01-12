'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SharedServiceFormFields from '../Shared/SharedServiceFormFields';
import DeleteWorkOrderButton from '@/components/Buttons/DeleteWorkOrderButton';
import { toast } from 'react-hot-toast';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { useVehicleStore } from '@/store/useVehicleStore';
import { IVehicle } from '@/types/vehicle';

export default function WorkOrderForm({
   workOrderId,
   vehicleId,
   vehicles,
}: {
   workOrderId?: string;
   vehicleId?: string;
   vehicles: IVehicle[];
}) {
   const router = useRouter();

   // Zustand stores
   const storeWO = useWorkOrderStore((s) => s.selectedWorkOrder);
   const fetchWorkOrder = useWorkOrderStore((s) => s.fetchWorkOrder);

   const selectedVehicle = useVehicleStore((state) => state.selectedVehicle);
   const fetchVehicle = useVehicleStore((state) => state.fetchVehicle);
   const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);

   //console.log('vehicleId issue?', storeWO);

   // Determine mode
   const isEditing = Boolean(workOrderId);

   //  1) Fetch Work Order (editing only)
   useEffect(() => {
      if (isEditing) {
         if (!storeWO || storeWO._id !== workOrderId) {
            // If store is empty OR store has a different workOrderId, fetch it
            fetchWorkOrder(workOrderId);
         }
      }
   }, [isEditing, storeWO, workOrderId, fetchWorkOrder]);

   // BLOCK URL: if No IDs → redirect
   useEffect(() => {
      if (!workOrderId && !vehicleId) {
         router.push('/protectedPages/vehicles');
      }
   }, [workOrderId, vehicleId, router]);

   // 2) derive id
   const derivedVehicleId =
      (isEditing ? storeWO?.vehicleId : vehicleId || selectedVehicle?._id) ?? '';

   // 4) Fetch vehicle (new WO only)
   useEffect(() => {
      if (!isEditing && derivedVehicleId && !selectedVehicle) {
         fetchVehicle(derivedVehicleId);
      }
   }, [isEditing, derivedVehicleId, selectedVehicle, fetchVehicle]);

   // 2) Form State

   const [form, setForm] = useState(() => {
      if (isEditing && storeWO) {
         return {
            workOrderId: storeWO._id,
            vehicleId: storeWO.vehicleId ?? '',
            serviceType: storeWO.serviceType ?? '',
            serviceDueDate: storeWO.serviceDueDate?.split('T')[0] ?? '',
            serviceDueKM: storeWO.serviceDueKM ?? '',
            mileage: storeWO.mileage ?? '',
            location: storeWO.location ?? ['N/A'],
            notes: storeWO.notes ?? '',
            completedBy: storeWO.completedBy ?? '',
            isRecurring: storeWO.isRecurring ?? false,
            serviceFrequencyKM: storeWO.serviceFrequencyKM ?? '',
            serviceFrequencyWeeks: storeWO.serviceFrequencyWeeks ?? '',
         };
      } // New Work Order
      return {
         workOrderId: '',
         vehicleId: derivedVehicleId || '',
         serviceType: '',
         serviceDueDate: '',
         serviceDueKM: '',
         mileage: '',
         location: ['N/A'],
         notes: '',
         completedBy: '',
         isRecurring: false, serviceFrequencyKM: '', serviceFrequencyWeeks: '',
       };
      
   });

   //3 update form when storeWO loads(edit mode)
   useEffect(() => {
      if (isEditing && storeWO) {
         setForm({
            workOrderId: storeWO?._id,
            vehicleId: storeWO.vehicleId ?? '',
            serviceType: storeWO.serviceType ?? '',
            serviceDueDate: storeWO.serviceDueDate?.split('T')[0] ?? '',
            serviceDueKM: storeWO.serviceDueKM ?? '',
            mileage: storeWO.mileage ?? '',
            location: storeWO.location ?? ['N/A'],
            notes: storeWO.notes ?? '',
            completedBy: storeWO.completedBy ?? '',
              isRecurring: storeWO.isRecurring ?? false,
            serviceFrequencyKM: storeWO.serviceFrequencyKM ?? '',
            serviceFrequencyWeeks: storeWO.serviceFrequencyWeeks ?? '',
         });
      }
   }, [isEditing, storeWO]);

   // 4. Block rendering ONLY when editing and store isn't loaded

   if (isEditing && !storeWO) {
      return <div>Loading…</div>;
   }

   // allow updates when viewing work order(add notes ect)

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
      console.log('event ', name);
      // If the user changed the vehicle dropdown, update the store
      if (name === 'vehicleId') {
         const v = vehicles.find((veh) => veh._id === value);
         console.log('changed vehicle ', v);
         setSelectedVehicle(v);
      }
   }

   async function handleSubmit(e) {
      e.preventDefault();
      console.log('submitted to API:', form);
      if (!form.vehicleId) {
         toast.error('Vehicle is required');
         return;
      }
      const url = isEditing ? `/api/work-orders/${form.workOrderId}` : `/api/work-orders`;
      const method = isEditing ? 'PUT' : 'POST';

      const workOrderName = `${selectedVehicle.year} ${selectedVehicle.make} — ${selectedVehicle.name}`;
      const payload = { ...form, name: workOrderName };
      console.log('saving ', payload);
      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      });

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
