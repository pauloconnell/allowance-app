"use client";

export default function SharedServiceFormFields({
  form,
  setForm,
  vehicles,
  serviceTypes,
  locations,
  handleChange
}) {
  return (
    <>
      {/* Vehicle */}
      <div>
        <label className="block font-medium mb-1">Vehicle</label>
        <select
          name="vehicleId"
          value={form.vehicleId}
         onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select a vehicle</option>
          {vehicles?.map((v) => (
            <option key={v._id} value={v._id}>
              {v.year} {v.make} {v.model} {v.name}
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
          {locations.map((loc) => (
            <label key={loc.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={loc.value}
                checked={form.location.includes(loc.value)}
                onChange={(e) => {
                  const value = e.target.value;
                  let updated = [...form.location];

                  if (updated.includes(value)) {
                    updated = updated.filter((l) => l !== value);
                  } else {
                    updated.push(value);
                  }

                  if (updated.length > 1 && updated.includes("N/A")) {
                    updated = updated.filter((l) => l !== "N/A");
                  }

                  if (updated.length === 0) {
                    updated = ["N/A"];
                  }

                  setForm({ ...form, location: updated });
                }}
                className="h-4 w-4"
              />
              <span>{loc.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mileage */}
      <label className="flex flex-col flex-1 basis-1/2">
        Mileage
        <input
          type="number"
          name="mileage"
          value={form.mileage}
          onChange={handleChange}
          className="border border-gray-300 rounded-full px-4 py-2"
          placeholder="e.g. 182000"
          required
        />
      </label>

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
    </>
  );
}
