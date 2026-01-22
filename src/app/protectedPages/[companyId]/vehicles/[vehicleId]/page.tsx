import Link from 'next/link';
import { getServiceHistory } from '@/lib/serviceRecords';
import { getVehicleById } from '@/lib/vehicles';
import ServiceDue from '@/components/Dashboard/ServiceDue/ServiceDue';

interface Props {
   params: Promise<{ companyId: string; vehicleId: string }>;
}

export default async function VehiclePage({ params }: Props) {
   const { companyId, vehicleId } = await params;

   // Fetch vehicle + service history from MongoDB
   const vehicle = await getVehicleById(vehicleId, companyId);
   const history = await getServiceHistory(vehicleId, companyId);

   if (!vehicle) {
      return (
         <div className="text-red-600 p-6">
            Vehicle not found
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Back Button */}
         <div className="flex justify-between items-center mb-6 mt-3 mx-6">
            <Link
               href={`/protectedPages/${companyId}/dashboard`}
               className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
               Back to Dashboard
            </Link>
            <Link
               href={`/protectedPages/${companyId}/vehicles/${vehicleId}/edit`}
               className="bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
               Edit Vehicle
            </Link>
         </div>

         {/* Vehicle Title */}
         <h1 className="text-2xl font-bold">
            {vehicle?.year} {vehicle?.make} {vehicle?.model} - {vehicle?.nickName}
         </h1>
         <h2>KM: {vehicle?.mileage}</h2>

         {/* Action Buttons */}
         <div className="flex gap-4">
            <Link
               href={`/protectedPages/${companyId}/work-orders/new?vehicleId=${vehicleId}`}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
               Create Work Order
            </Link>

            <Link
               href={`/protectedPages/${companyId}/record-service/${vehicleId}`}
               className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
               Record Service
            </Link>
         </div>

         {/* Service Due */}
         <section className="flex flex-col gap-6 min-h-[150px]">
            <h2 className="text-2xl font-semibold">Service Due</h2>
            <ServiceDue companyId={companyId} />
         </section>

         {/* Service History */}
         <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold">Service History</h2>
            {history.length === 0 ? (
               <p className="text-gray-500">No service history yet</p>
            ) : (
               <div className="space-y-4">
                  {history.map((record) => (
                     <div
                        key={record._id}
                        className="border border-gray-300 rounded-lg p-4 bg-white"
                     >
                        <p className="font-semibold">{record.serviceType}</p>
                        <p className="text-sm text-gray-600">
                           {new Date(record.serviceDate).toLocaleDateString()}
                        </p>
                        {record.notes && <p className="text-sm">{record.notes}</p>}
                     </div>
                  ))}
               </div>
            )}
         </section>
      </div>
   );
}
