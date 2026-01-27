'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SharedServiceFormFields from '../Shared/SharedServiceFormFields';
import DeleteWorkOrderButton from '@/components/Buttons/DeleteWorkOrderButton';
import { toast } from 'react-hot-toast';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { useChildStore } from '@/store/useVehicleStore';
import { IVehicle } from '@/types/IVehicle';
import { IFormWorkOrder } from '@/types/IFormWorkOrder';
import { sanitizeInput } from '@/lib/utils/sanitizeInput';


interface WorkOrderFormProps {
   familyId: string;
   workOrderId?: string;
   childId?: string;
   children: IVehicle[];
}

export default function WorkOrderForm({
   familyId,
   workOrderId,
   childId,
   children,
}: WorkOrderFormProps) {
   const router = useRouter();

   // Zustand stores
   const storeWO = useWorkOrderStore((s) => s.selectedWorkOrder);
   const fetchWorkOrder = useWorkOrderStore((s) => s.fetchWorkOrder);

   const selectedChild = useChildStore((state) => state.selectedChild);
   const fetchChild = useChildStore((state) => state.fetchChild);
   const setSelectedChild = useChildStore((s) => s.setSelectedChild);
   const fetchAllWorkOrders = useWorkOrderStore((s) => s.fetchAllWorkOrders);

   //console.log('vehicleId issue?', storeWO);

   // Determine mode
   const isEditing = Boolean(workOrderId);

   //  1) Fetch Work Order (editing only)
   useEffect(() => {
      if (isEditing && workOrderId) {
         if (!storeWO || storeWO._id !== workOrderId) {
            // If store is empty OR store has a different workOrderId, fetch it
            fetchWorkOrder(workOrderId);
         }
      }
   }, [isEditing, storeWO, workOrderId, fetchWorkOrder]);

   // BLOCK URL: if No IDs → redirect
   useEffect(() => {
      if (!workOrderId && !childId) {
         router.push(`/protectedPages/${familyId}/children`);
      }
   }, [workOrderId, childId, familyId, router]);

   // 2) derive id
   const derivedChildId =
      (isEditing ? storeWO?.vehicleId : childId || selectedChild?._id) ?? '';

   // 4) Fetch child (new WO only)
   useEffect(() => {
      if (!isEditing && derivedChildId && !selectedChild) {
         fetchChild(derivedChildId);
      }
   }, [isEditing, derivedChildId, selectedChild, fetchChild]);

   // 2) Form State

   const [form, setForm] = useState<IFormWorkOrder>(() => {
      if (isEditing && storeWO) {
         return {
            familyId: familyId,
            workOrderId: storeWO._id,
            vehicleId: storeWO.vehicleId ?? '',
            serviceType: storeWO.serviceType ?? '',
            serviceDueDate: storeWO.serviceDueDate
               ? String(storeWO.serviceDueDate).split('T')[0]
               : '',
            serviceDueKM: String(storeWO.serviceDueKM) ?? '',
            mileage: String(storeWO.mileage) ?? '',
            location: storeWO.location ?? ['N/A'],
            notes: storeWO.notes ?? '',
            serviceDate: storeWO.serviceDate
               ? String(storeWO.serviceDate).split('T')[0]
               : '',
            completedBy: storeWO.completedBy ?? '',
            isRecurring: storeWO.isRecurring ?? false,
            serviceFrequencyKM: String(storeWO.serviceFrequencyKM) ?? '',
            serviceFrequencyWeeks: String(storeWO.serviceFrequencyWeeks) ?? '',
         };
      } // New Work Order
      return {
         familyId: familyId,
         workOrderId: '',
         vehicleId: derivedChildId || '',
         serviceType: '',
         serviceDueDate: '',
         serviceDueKM: '',
         mileage: '',
         location: ['N/A'],
         notes: '',
         serviceDate: '',
         completedBy: '',
         isRecurring: false,
         serviceFrequencyKM: '',
         serviceFrequencyWeeks: '',
      };
   });

   //3 update form when storeWO loads(edit mode)
   useEffect(() => {
      if (isEditing && storeWO) {
         setForm({
            familyId: familyId,
            workOrderId: storeWO?._id,
            vehicleId: storeWO.vehicleId ?? '',
            serviceType: storeWO.serviceType ?? '',
            serviceDueDate: String(storeWO.serviceDueDate)?.split('T')[0] ?? '',
            serviceDueKM: String(storeWO.serviceDueKM) ?? '',
            mileage: String(storeWO.mileage) ?? '',
            location: storeWO.location ?? ['N/A'],
            notes: storeWO.notes ?? '',
            serviceDate: storeWO.serviceDate
               ? String(storeWO.serviceDate).split('T')[0]
               : '',
            completedBy: storeWO.completedBy ?? '',
            isRecurring: storeWO.isRecurring ?? false,
            serviceFrequencyKM: String(storeWO.serviceFrequencyKM) ?? '',
            serviceFrequencyWeeks: String(storeWO.serviceFrequencyWeeks ?? ''),
         });
      }
   }, [isEditing, storeWO, familyId]);

   // 4. Block rendering ONLY when editing and store isn't loaded

   if (isEditing && !storeWO) {
      return <div>Loading…</div>;
   }

   // allow updates when viewing work order(add notes ect)

  

   function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
      const { name, value, type } = e.target;

      // If the user changed the child dropdown, update the store
      if (name === 'vehicleId') {
         const c = children.find((child) => child._id === value);
         console.log('changed child ', c);
         if (c) {
            setSelectedChild(c);
         }
      }

      const cleaned = sanitizeInput(value);

      setForm({ ...form, [name]: type === 'number' ? Number(cleaned) : cleaned });
      //console.log('event ', name);
   }

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      console.log('submitted to API:', form);
      if (!form.vehicleId) {
         toast.error('Vehicle is required');
         return;
      }
      const url = isEditing ? `/api/work-orders/${form.workOrderId}` : `/api/work-orders`;
      const method = isEditing ? 'PUT' : 'POST';

      const workOrderName = `${selectedVehicle?.year} ${selectedVehicle?.make} — ${selectedVehicle?.nickName}`;
      const payload = { ...form, familyId, nickName: workOrderName };
      console.log('saving ', payload);
      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      });

      if (res.ok) {
         toast.success('Work order saved');
         await fetchAllWorkOrders(familyId); // refresh Zustand store
         router.push(`/protectedPages/${familyId}/vehicles/${form.vehicleId}`);
      } else {
         toast.error('Failed to save work order');
      }
   }

   // handle complete will complete a work order to mark it done:
   const handleComplete = async () => {
      const res = await fetch(`/api/work-orders/${form.workOrderId}/complete`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ familyId, completedBy: form.completedBy }),
      });

      const data = await res.json();

      toast.success('Work order completed');
      await fetchAllWorkOrders(familyId); // refresh Zustand store
      router.push(`/protectedPages/${familyId}/vehicles/${form.vehicleId}`);

      router.refresh();
   };

   return (
      <form
         onSubmit={handleSubmit}
         className="bg-white p-6 rounded-lg shadow-sm border space-y-6"
      >
         <SharedServiceFormFields<IFormWorkOrder>
            form={form}
            setForm={setForm}
            vehicles={vehicles}
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
                  title="Please Enter Tech's name"
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
