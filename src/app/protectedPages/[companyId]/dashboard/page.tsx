import ServiceDue from "@/components/ServiceDue/ServiceDue";
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
    vehicles = await getAllVehicles(companyId);
  } catch (err) {
    console.error("Failed to load vehicles:", err);
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <p className="text-danger-600 font-semibold text-lg">
            Error loading vehicles
          </p>
          <p className="text-secondary-600 mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-secondary-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-secondary-600 mt-2">Manage your fleet and service records</p>
          </div>

          <Link
            href={`/protectedPages/${companyId}/record-service`}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <span className="text-lg">+</span>
            <span className="ml-2">Record Service</span>
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Service Due Card - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-secondary-900">Service Due</h2>
                <div className="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-lg">
                  <span className="text-primary-600 font-semibold">⚙️</span>
                </div>
              </div>
              <div className="min-h-[200px] sm:min-h-[300px]">
                <ServiceDue companyId={companyId} />
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-secondary-900 mb-6">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link
                href={`/protectedPages/${companyId}/vehicles/new`}
                className="flex items-center justify-center px-4 py-3 bg-primary-50 text-primary-700 font-semibold rounded-lg hover:bg-primary-100 transition-colors duration-200 border border-primary-200"
              >
                <span>+ Add Vehicle</span>
              </Link>
              <Link
                href={`/protectedPages/${companyId}/work-orders`}
                className="flex items-center justify-center px-4 py-3 bg-secondary-50 text-secondary-700 font-semibold rounded-lg hover:bg-secondary-100 transition-colors duration-200 border border-secondary-200"
              >
                <span>📋 Work Orders</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Vehicles Section */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">Vehicles</h2>
              <p className="text-secondary-600 text-sm mt-1">
                {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} in fleet
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-lg">
              <span className="text-primary-600 font-semibold">🚗</span>
            </div>
          </div>
          <VehicleList vehicles={vehicles} companyId={companyId} />
        </div>
      </div>
    </div>
  );
}
