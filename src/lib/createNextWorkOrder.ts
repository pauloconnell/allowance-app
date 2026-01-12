import WorkOrder from "@/models/WorkOrder";
import Vehicle from "@/models/Vehicle";

export async function createNextWorkOrder(prevWO) {
   const vehicle = await Vehicle.findById(prevWO.vehicleId);
   if (!vehicle) return;

   // Compute next due KM
   const nextKM = prevWO.serviceFrequencyKM
      ? (prevWO.serviceDueKM ?? prevWO.mileage) + prevWO.serviceFrequencyKM
      : null;

   // Compute next due date
   const nextDate = prevWO.serviceFrequencyWeeks
      ? new Date(Date.now() + prevWO.serviceFrequencyWeeks * 7 * 24 * 60 * 60 * 1000)
      : null;

   // Create the new work order
   await WorkOrder.create({
      vehicleId: prevWO.vehicleId,
      name: prevWO.name,
      serviceType: prevWO.serviceType,
      notes: "",
      location: ["N/A"],
      mileage: vehicle.mileage, // current mileage
      status: "open",
      serviceDueDate: nextDate,
      serviceDueKM: nextKM,
      isRecurring: true,
      serviceFrequencyKM: prevWO.serviceFrequencyKM,
      serviceFrequencyWeeks: prevWO.serviceFrequencyWeeks,
   });
}
