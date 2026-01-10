import { getAllVehicles } from '@/lib/vehicles';
import WorkOrderForm from '@/components/Forms/WorkOrderForm';

export default async function NewWorkOrderPage({ params }: {params: { vehicleId: string }}) {
   const { vehicleId } = params;


   // Fetch all vehicles (for dropdowns, names, etc.)
   const vehicles = JSON.parse(JSON.stringify(await getAllVehicles()));

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-semibold mb-8">Create Work Order</h1>

            <WorkOrderForm vehicleId={vehicleId} vehicles={vehicles} />
         </div>
      </div>
   );
}
