
import WorkOrderForm from '@/components/Forms/WorkOrderForm';
import { getAllVehicles } from '@/lib/vehicles';


export default async function WorkOrderDetailPage({ params}: { params: { workOrderId: string } }) {
   const { workOrderId } = await params;
 


   // Fetch all vehicles (for dropdowns, names, etc.)
   const vehicles = JSON.parse(JSON.stringify(await getAllVehicles()));

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-semibold mb-8">Work Order Details</h1>
            <WorkOrderForm workOrderId={workOrderId} vehicles={vehicles} />
         </div>
      </div>
   );
}
