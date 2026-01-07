import { getAllVehicles } from '@/lib/vehicles';
import WorkOrderForm from '@/components/Forms/WorkOrderForm';

export default async function NewWorkOrderPage({ params, searchParams }) {
   const { vehicleId } = params;

   // Parse the serialized vehicle object
   const vehicle = searchParams.vehicle ? JSON.parse(searchParams.vehicle) : null;

   // Fetch all vehicles (for dropdowns, names, etc.)
   const vehicles = JSON.parse(JSON.stringify(await getAllVehicles()));

   // Pre-fill the form with the vehicleId and default Work Order values
   const prefill = {
      vehicleId,
      status: 'open',
      mileage: vehicle?.mileage ?? '',
      name: vehicle?.name ?? '',
      type: vehicle?.type ?? '',
      year: vehicle?.year ?? '',
   };

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-semibold mb-8">Create Work Order</h1>

            <WorkOrderForm prefill={prefill} vehicles={vehicles} />
         </div>
      </div>
   );
}
