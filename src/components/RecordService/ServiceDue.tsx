import Link from 'next/link';

export default function ServiceDue() {
   const workOrders = [
      {
         title: 'Oil Change',
         name: '2014 Subaru Forester',
         vehicleId: 'subaru-forester',
         due: '2026-01-10',
         dueKM: '220000',
         serviceType: 'Oil Change',
         location: 'N/A',
      },
   ];

   return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
         {workOrders.length === 0 && <p className="text-gray-500">No service due.</p>}

         <ul className="space-y-3">
            {workOrders.map((wo) => (
               <li
                  key={wo.vehicleId}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
               >
                  <Link
                     href={{
                        pathname: '/protectedPages/record-service',
                        query: {
                           vehicleId: wo.vehicleId,
                           serviceType: wo.serviceType,
                           location: wo.location,
                        },
                     }}
                  >
                     <div className="font-medium">{wo.title}</div>
                     <div className="text-sm text-gray-600">
                        {wo.name}, {wo.vehicleId}
                     </div>
                     <div className="text-sm text-gray-500">Due: {wo.due}</div>
                     <div className="text-sm text-gray-500">DueKM: {wo.dueKM}</div>
                  </Link>
               </li>
            ))}
         </ul>
      </div>
   );
}
