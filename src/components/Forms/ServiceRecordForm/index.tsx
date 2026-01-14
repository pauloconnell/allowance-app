'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SharedServiceFormFields from '../Shared/SharedServiceFormFields';
import { useVehicleStore } from '@/store/useVehicleStore';

export default function ServiceRecordForm({ vehicleId }) {
   const router = useRouter();

   // Zustand
   const vehicles = useVehicleStore((s) => s.allVehicles);
   const fetchAllVehicles = useVehicleStore((s) => s.fetchAllVehicles);
   const selectedVehicle = useVehicleStore((s) => s.selectedVehicle);
   const fetchVehicle = useVehicleStore((s) => s.fetchVehicle); // Fetch all vehicles if not loaded (dashboard mode)
   useEffect(() => {
      if (!vehicles.length) {
         fetchAllVehicles();
      }
   }, [vehicles, fetchAllVehicles]); // Fetch selected vehicle if vehicleId provided
   useEffect(() => {
      if (vehicleId && !selectedVehicle) {
         fetchVehicle(vehicleId);
      }
   }, [vehicleId, selectedVehicle, fetchVehicle]);

   // Form state
   const [form, setForm] = useState({
      vehicleId: vehicleId || '',
      serviceType: '',
      serviceDate: new Date().toISOString().split('T')[0],
      mileage: 0,
      location: ['N/A'],
      notes: '',
      completedBy: '',
      isRecurring: false, 
      serviceFrequencyKM: '', 
      serviceFrequencyWeeks: '',
   });

   // Update form.vehicleId when selectedVehicle loads
   useEffect(() => {
      if (selectedVehicle && !form.vehicleId) {
         setForm((prev) => ({ ...prev, vehicleId: selectedVehicle._id }));
      }
   }, [selectedVehicle, form.vehicleId]);

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
     const { name, value } = e.target; 
     // Special case: vehicle selection 
     if (name === "vehicleId") { 
      const v = vehicles.find((veh) => veh._id === value); 
      setForm((prev) => ({ ...prev, vehicleId: value, name: v?.name || "", // REQUIRED by WorkOrder schema 
      mileage: v?.mileage ?? prev.mileage, // set mileage to last known
      })); 
       return; } 
       // Generic update 
       setForm((prev) => ({ ...prev, [name]: value }));
   }

   async function handleSubmit(e) {
      e.preventDefault();
      console.log('about to save ', form);
      const res = await fetch('/api/service-records', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(form),
      });

      if (res.ok) {
         router.push(`/protectedPages/vehicles/${form.vehicleId}`);
      } else {
         alert('Failed to save record');
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

         {/* Service Record specific field */}
         <label className="flex flex-col flex-1">
            Date Service Performed
            <input
               type="date"
               name="serviceDate"
               value={form.serviceDate}
               onChange={handleChange}
               className="border rounded-full px-4 py-2"
               required
            />
         </label>

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
