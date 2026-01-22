import ServiceDue from "@/components/Dashboard/ServiceDue/ServiceDue";
import { getAllVehicles } from "@/lib/vehicles";
import VehicleList from "@/components/vehicle/VehicleList";
import Link from "next/link";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { companyId } = await params;
    let vehicles = []; 
    try { 
      vehicles = await getAllVehicles(companyId);      // on server so hit  DB directlygetAllVehicles(); 
      
    } catch (err) { 
      console.error("Failed to load vehicles:", err); 
      return <div className="text-red-600">Error loading vehicles</div>; 
    }
    
  return (
    <div className="min-h-screen bg-gray-50"> 
      {/* Same background as homepage */}

      <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-16">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <Link
            href="/protectedPages/record-service"
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Record Service
          </Link>
        </header>

        {/* Service Due */}
        <section className="flex flex-col gap-6 min-h-[150px] sm:min-h-[300px]">
          <h2 className="text-2xl font-semibold">Service Due</h2>
          <ServiceDue companyId={companyId} />
        </section>

        {/* Vehicles */}
        <section className="flex flex-col gap-6">
              <Link href="/protectedPages/vehicles/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" >
          Add Vehicle
        </Link>
          <h2 className="text-2xl font-semibold">Vehicles</h2>
          <VehicleList vehicles={vehicles} companyId={companyId} />
        </section>
      </div>
    </div>
  );
}
