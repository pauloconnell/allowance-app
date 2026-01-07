'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecordServiceForm({ prefill, vehicles }) {
   const isWorkOrder = prefill.serviceType?.trim().toLowerCase() === 'work order';

   const derivedVehicleId = prefill.vehicleId ?? prefill._id?.toString?.() ?? '';

   const [form, setForm] = useState({
      vehicleId: derivedVehicleId,
      serviceType: prefill.serviceType,
      // Only one of these matters depending on mode
      date: isWorkOrder ? '' : new Date().toISOString().split('T')[0],
      serviceDue: isWorkOrder ? prefill.serviceDue || '' : '',
      mileage: prefill.mileage ?? 0,
      location: prefill.location?.split(',') ?? ['na'],
      notes: '',
   });

   console.log('service form data: ', { form });

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
      setForm({ ...form, [e.target.name]: e.target.value });
   }

   const handleSubmit = async (e) => {
      e.preventDefault();

      const endpoint = isWorkOrder ? '/api/work-orders' : '/api/service-records';

      const res = await fetch(endpoint, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(form),
      });

      if (res.ok) {
         router.push(`/protectedPages/vehicles/${form.vehicleId}`);
      } else {
         alert('Failed to save record');
      }
   };

   // for cancel button
   const router = useRouter();

   return (
      <form
         onSubmit={handleSubmit}
         className="bg-white p-6 rounded-lg shadow-sm border space-y-6"
      >
         {/* Vehicle */}
         <div>
            <label className="block font-medium mb-1">Vehicle</label>
            <select
               name="id"
               value={form.vehicleId}
               onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
               className="border rounded px-3 py-2 w-full"
            >
               <option value="">Select a vehicle</option>
               {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                     {v.year} {v.make} {v.model} {v.name}`
                  </option>
               ))}
            </select>
         </div>

         {/* Service Type */}
         <div>
            <label className="block font-medium mb-1">Service Type</label>
            <select
               name="serviceType"
               value={form.serviceType}
               onChange={handleChange}
               className="w-full border rounded-lg p-2"
               required
            >
               <option value="">Select service</option>
               {serviceTypes.map((s) => (
                  <option key={s} value={s}>
                     {s}
                  </option>
               ))}
            </select>
         </div>

         {/* Location */}
         <div>
            <label className="block font-medium mb-2">Location</label>

            <div className="grid grid-cols-2 gap-3">
               {locations.map((loc) => {
                  return (
                     <label
                        key={loc.value}
                        className="flex items-center gap-2 cursor-pointer"
                     >
                        <input
                           type="checkbox"
                           value={loc.value}
                           checked={form.location.includes(loc.value)}
                           onChange={(e) => {
                              const value = e.target.value;
                              let updated = [...form.location];

                              // Toggle selection
                              if (updated.includes(value)) {
                                 updated = updated.filter((l) => l !== value);
                              } else {
                                 updated.push(value);
                              }

                              // If selecting anything other than N/A → remove N/A
                              if (updated.length > 1 && updated.includes('N/A')) {
                                 updated = updated.filter((l) => l !== 'N/A');
                              }

                              // If nothing selected → default back to N/A
                              if (updated.length === 0) {
                                 updated = ['N/A'];
                              }

                              //   // Group logic:
                              //   // Selecting "front" auto-selects FL + FR
                              //   if (value === "front" && !form.location.includes("front")) {
                              //     updated = updated.filter((l) => !["fl", "fr"].includes(l));
                              //     updated.push("fl", "fr");
                              //   }

                              //   // Selecting "rear" auto-selects RL + RR
                              //   if (value === "rear" && !form.location.includes("rear")) {
                              //     updated = updated.filter((l) => !["rl", "rr"].includes(l));
                              //     updated.push("rl", "rr");
                              //   }

                              setForm({ ...form, location: updated });
                           }}
                           className="h-4 w-4"
                        />

                        <span>{loc.label}</span>
                     </label>
                  );
               })}
            </div>
         </div>

         <div className="flex flex-col md:flex-row gap-4">
            {' '}
            {/* Date field */}
            <label className="flex flex-col flex-1 basis-1/2">
               {isWorkOrder ? 'Service Due Date:' : 'Date Service Performed:'}
               <input
                  type="date"
                  name={isWorkOrder ? 'serviceDueDate' : 'serviceDate'}
                  required={!isWorkOrder}
                  defaultValue={
                     isWorkOrder ? prefill?.serviceDueDate : prefill?.serviceDate
                  }
                  className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
            </label>
            {/* Mileage */}
            <label className="flex flex-col flex-1 basis-1/2">
               Mileage
               <input
                  type="number"
                  name="mileage"
                  value={form?.mileage}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 182000"
                  required
               />
            </label>
         </div>

         {/* Notes */}
         <div>
            <label className="block font-medium mb-1">Notes</label>
            <textarea
               name="notes"
               value={form.notes}
               onChange={handleChange}
               className="w-full border rounded-lg p-2"
               rows={4}
               placeholder="Optional notes..."
            />
         </div>

         {/* Submit */}
         <div className="flex justify-between items-center mt-6 px-3">
            <button
               type="submit"
               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
               Save Service
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
