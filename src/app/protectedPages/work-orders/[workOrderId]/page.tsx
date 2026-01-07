import RecordServiceForm from '@/components/RecordService/RecordServiceForm';
import { getAllVehicles } from '@/lib/vehicles';

export default async function WorkOrderDetailPage({ params, searchParams }) {
   const { workOrderId } = params;
   

   // Build a plain prefill object from searchParams
   const prefill = {
      workOrderId,
      vehicleId: searchParams.vehicleId || '',
      serviceType: searchParams.serviceType || '',
      location: searchParams.location || '',
      mileage: searchParams.mileage || '',
      status: searchParams.status || 'open',
      serviceDueDate: searchParams.serviceDueDate || '',
      name: searchParams.name || '',
      type: searchParams.type || '',
      year: searchParams.year || '',
   };
   console.log('work order view page got ', workOrderId, searchParams, prefill);

   // Fetch all vehicles (for dropdowns, names, etc.)
   const vehicles = JSON.parse(JSON.stringify(await getAllVehicles()));

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-semibold mb-8">Work Order Details</h1>

            <RecordServiceForm prefill={prefill} vehicles={vehicles} />
         </div>
      </div>
   );
}
