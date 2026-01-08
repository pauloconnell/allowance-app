"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SharedServiceFormFields from "../Shared/SharedServiceFormFields";

export default function ServiceRecordForm({ prefill, vehicles }) {
  const router = useRouter();

  const [form, setForm] = useState({
    vehicleId: prefill.vehicleId ?? "",
    serviceType: prefill.serviceType,
    date: new Date().toISOString().split("T")[0],
    mileage: prefill.mileage ?? 0,
    location: prefill.location?.split(",") ?? ["N/A"],
    notes: "",
  });

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

  async function handleSubmit(e) {
    e.preventDefault();
    console.log('about to save ', form)
    const res = await fetch("/api/service-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push(`/protectedPages/vehicles/${form.vehicleId}`);
    } else {
      alert("Failed to save record");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">

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
          name="date"
          value={form.date}
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

        <button type="button" onClick={() => router.back()} className="bg-gray-200 px-4 py-2 rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  );
}
