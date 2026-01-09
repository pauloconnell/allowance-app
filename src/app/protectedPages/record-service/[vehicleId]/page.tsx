import { getAllVehicles } from '@/lib/vehicles';
import RecordServiceForm from '@/components/RecordService/RecordServiceForm';
import ServiceRecordForm from '@/components/Forms/ServiceRecordForm';

export default async function RecordServicePage({ searchParams }) {
  

    const prefill = {//...searchParams}; // Next.js requires searchParams to be spread so they become plain props for Client Components
      vehicleId: searchParams.vehicleId || '',          // // Manually construct a plain object; spreading searchParams carries hidden symbol keys
                                        // must pick only params I need
      name: searchParams.name || '',
      serviceType: searchParams.serviceType || '',
      location: searchParams.location || ['N/A'],
      mileage: searchParams.mileage || '',
   };

    const vehicles = JSON.parse(JSON.stringify(await getAllVehicles()));   // Deep‑serialize to strip symbols/prototypes from nested Mongo data
   console.log("page got", vehicles)

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-semibold mb-8">Record Service</h1>
            <ServiceRecordForm prefill={prefill} vehicles={vehicles} />


         </div>
      </div>
   );
}
