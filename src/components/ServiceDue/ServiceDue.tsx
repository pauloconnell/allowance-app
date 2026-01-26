'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IWorkOrder } from '@/types/IWorkOrder';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { useChildStore } from '@/store/useVehicleStore';
import { LoadingSpinner} from '@/components/UI/LoadingSpinner';
import { CardWorkOrder } from '@/components/UI/CardWorkOrder';


interface ServiceDueProps {
   childId?: string;
   familyId: string;
}

export default function ServiceDue({ childId, familyId }: ServiceDueProps) {
   const fetchAllWorkOrders = useWorkOrderStore((s) => s.fetchAllWorkOrders);
   const setSelectedWorkOrder = useWorkOrderStore((s) => s.setSelectedWorkOrder);
   const getUpcomingWorkOrders = useWorkOrderStore((s) => s.getUpcomingWorkOrders);
   const [loading, setLoading] = useState(true);
   const { selectedChild, fetchChild } = useChildStore();
   

   useEffect(() => {
      if (!familyId || familyId === 'undefined') return;
      
      setLoading(true);
      fetchAllWorkOrders(familyId)
      .catch(console.error)
      .finally(() => setLoading(false));
   }, [familyId, fetchAllWorkOrders]);

   // If a childId is passed, filter upcoming WOs for that child
   const upcoming = getUpcomingWorkOrders();
   //console.log({ upcoming });
   const workOrders = childId
      ? upcoming.filter((wo) => wo.vehicleId === childId)
      : upcoming; // else show all

   // if passed childId in URL, then populate store with child details
   useEffect(() => {
       setLoading(true);
      if (childId && !selectedChild) {
         fetchChild(childId)
            .catch(console.error)
            .finally(() => setLoading(false));
      }
   }, [childId, selectedChild]);

    if (loading) return <div><LoadingSpinner /> Loading…</div>;

   if (!workOrders.length) {
      return <div>No upcoming service due</div>;
   }
  
   //if (workOrders.length === 0) return <div className="text-gray-500">No outstanding work orders</div>;

   return (
      <div className="border border-yellow-200  rounded-lg p-4 bg-yellow-100 shadow-sm">
       

         <ul className="space-y-3 ">
            {workOrders.map((wo) => (
               <li
                  key={wo._id}
                  className="p-3 border rounded-lg bg-yellow-50 hover:bg-gray-50 transition"
               >

                  <CardWorkOrder wo={wo} familyId={familyId} />
                  {/* <Link
                     href={`/protectedPages/${familyId}/work-orders/${wo._id}`}
                     onClick={() => setSelectedWorkOrder(wo)}
                  >
                     <div className="text-center font-extrabold text-lg mb-2">
              
                        {wo?.nickName ?? ''}
                     </div>

                     <div className="font-bold">{wo.serviceType}
                     {wo.serviceType === 'Other' && wo.notes && (
                        <div className="mb-2 text-sm ">
                           {wo.notes}
                        </div>
                     )}
    
                     </div>
                                       
                    {wo.serviceDueDate && ( <div className="text-sm text-gray-500">
                        Service Due: {String(wo.serviceDueDate).split("T")[0]}
                     </div>)}
                     {wo.serviceDueKM && (
                     <div className="text-sm text-gray-500">
                        Service Due @: {wo.serviceDueKM} KM
                     </div>)}
                  </Link> */}
               </li>
            ))}
         </ul>
      </div>
   );
}
