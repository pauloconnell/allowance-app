import { getAllVehicles } from '@/lib/vehicles';
import WorkOrderForm from '@/components/Forms/WorkOrderForm';
import { IVehicle } from '@/types/IVehicle';

export default async function NewWorkOrderPage({ params }: {params: { vehicleId: string }}) {
   const { vehicleId } = params;
   let vehicles:IVehicle[] = [];
   try{
   // Fetch all vehicles (for dropdowns, names, etc.)
   vehicles = JSON.parse(JSON.stringify(await getAllVehicles()));
   }catch(err){
      console.error("Error fetching vehicles:", err);
      return( <div className="min-h-screen flex items-center justify-center">
         <p className="text-red-500 text-lg">Failed to load vehicles. Please try again later.</p>
      </div>
      );
      
   }

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-semibold mb-8">Create Work Order</h1>

            <WorkOrderForm vehicleId={vehicleId} vehicles={vehicles} />
         </div>
      </div>
   );
}
