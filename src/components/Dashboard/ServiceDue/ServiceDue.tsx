'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IWorkOrder } from '@/types/workorder';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { useVehicleStore } from '@/store/useVehicleStore';
interface ServiceDueProps {
   vehicleId: string;
}

export default function ServiceDue({ vehicleId }: ServiceDueProps) {
   const [workOrders, setWorkOrders] = useState<IWorkOrder[]>([]);
   const [loading, setLoading] = useState(true);

   // use Zustand store to contain the Work Order details and vehicle details
   const setSelectedWorkOrder = useWorkOrderStore((wo) => wo.setSelectedWorkOrder);
   const { selectedVehicle, fetchVehicle } = useVehicleStore();

   useEffect(() => {
      async function load() {
         try {
            const url = vehicleId // get all work orders, or only specific vehicle if passed vehicleId
               ? `/api/work-orders?vehicleId=${vehicleId}`
               : `/api/work-orders`;
            const res = await fetch(url);
            const data = await res.json();

            // sanitize dates here -mongoDB needs full date, but HTML needs it like this:
            const sanitized = data.map((wo) => ({
               ...wo,
               serviceDueDate: wo.serviceDueDate ? wo.serviceDueDate.split('T')[0] : '',
            }));

            setWorkOrders(sanitized);
         } catch (err) {
            console.error('Failed to load work orders', err);
         } finally {
            setLoading(false);
         }
      }
      load();
   }, [vehicleId]);

   // if passed vehicleId in URL, then populate store with vehicle details
   useEffect(() => {
      if (vehicleId && !selectedVehicle) {
         fetchVehicle(vehicleId);
      }
   }, [vehicleId, selectedVehicle]);



   if (loading) return <div>Loading…</div>;
   //if (workOrders.length === 0) return <div className="text-gray-500">No outstanding work orders</div>;

   

   return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
         {workOrders.length === 0 && <p className="text-gray-500">No service due.</p>}

         <ul className="space-y-3">
            {workOrders.map((wo) => (
               <li
                  key={wo._id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
               >
                  <Link
                     href={`/protectedPages/work-orders/${wo._id}`}
                     onClick={() => setSelectedWorkOrder(wo)}
                  >
                     <div className="text-center font-extrabold text-lg mb-2">
                         {/* <pre className="text-xs text-left"> {JSON.stringify(wo, null, 2)} </pre>  */}
                       {wo?.name ?? ''} 
                     </div>
                     <div className="font-medium">{wo.serviceType}</div>
                     <div className="text-sm text-gray-600"></div>
                     <div className="text-sm text-gray-500">
                        Service Due: {wo.serviceDueDate}
                     </div>
                     <div className="text-sm text-gray-500">
                        Service Due @: {wo.serviceDueKM} KM
                     </div>
                  </Link>
               </li>
            ))}
         </ul>
      </div>
   );
}
