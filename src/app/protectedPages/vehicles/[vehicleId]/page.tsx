import Link from 'next/link';
import { getVehicleById, getServiceHistory } from '@/lib/vehicles';
import ServiceDue from "@/components/RecordService/ServiceDue";
//import { requireAuth } from '@/lib/requireAuth';

interface Props {
   params: { vehicleId: string };
}

export default async function VehiclePage({ params }: Props) {
   const { vehicleId } = params;

   // done in the layout for protected folder await requireAuth(); // 🔐 protect the page

   // Fetch vehicle + service history from MongoDB
   const vehicle = await getVehicleById(vehicleId);
   console.log('vehicle page:',{vehicleId}, { vehicle });
   const history = await getServiceHistory(vehicleId);

   return (
      <div className="space-y-6">
         {/* Back Button */}
         <div className="flex justify-between items-center mb-6 mt-3 mx-6">
            <Link
               href="/protectedPages/dashboard"
               className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
               Back to Dashboard
            </Link>
            <Link
               href={`/protectedPages/vehicles/${vehicleId}/edit`}
               className="bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
               Edit Vehicle
            </Link>
         </div>

         {/* Vehicle Title */}
         <h1 className="text-2xl font-bold">
            {vehicle?.year} {vehicle?.make} {vehicle?.model} Name: {vehicle?.name}
         </h1>
         <h2>
            KM:{vehicle?.mileage}
         </h2>

         {/* Action Buttons */}
         <div className="flex gap-4">
            <Link
               href={{
                  pathname: `/protectedPages/work-orders/${vehicleId}/new`,
                  query: { vehicle: JSON.stringify(vehicle), // pass full object 
                  },
               }}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
               Create Work Order
            </Link>

            <Link
               href={{
                  pathname: '/protectedPages/record-service',
                  query: {
                     vehicleId,
                     serviceType: 'Inspection',
                     name: vehicle?.name,
                     location: 'na',
                  },
               }}
               className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
               Record Inspection
            </Link>

            <Link
               href={{
                  pathname: '/protectedPages/record-service',
                  query: {
                     vehicleId,
                     name: vehicle?.name,
                  },
               }}
               className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
               Record Service
            </Link>
         </div>

            {/* Service Due */}
                 <section className="flex flex-col gap-6">
                   <h2 className="text-2xl font-semibold">Service Due</h2>
                   <ServiceDue />
                 </section>

         {/* Service History */}
         <div>
            <h2 className="text-xl font-semibold mb-2">Service History</h2>

            {history.length === 0 && (
               <p className="text-gray-500">No service records yet.</p>
            )}

            <ul className="space-y-3">
               {history.map((item) => (
                  <li key={item._id} className="border p-3 rounded-lg">
                     <div className="font-medium">{item.serviceType}</div>
                     <div className="text-sm text-gray-600">
                        {item.date} — {item.mileage} km
                     </div>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   );
}
