import Link from "next/link";
import { getVehicleById } from "@/lib/vehicles";
import EditFormWrapper from "./EditFormWrapper";
import mongoose from "mongoose";

interface Props {
   params: Promise<{ companyId: string; vehicleId: string }>;
}

export default async function EditVehiclePage({ params }: Props) {
   const { companyId, vehicleId } = await params;

   if (!mongoose.isValidObjectId(vehicleId)) {
      return (
         <div className="text-red-600 p-6">
            Invalid vehicle ID format
         </div>
      );
   }

   let vehicle = null;
   try {
      // Fetch vehicle from DB with company scope
      const doc = await getVehicleById(vehicleId, companyId);
      vehicle = JSON.parse(JSON.stringify(doc));
   } catch (err) {
      console.error('Failed to load vehicle:', err);
      return (
         <div className="text-red-600 p-6">
            Failed to load vehicle. Please try again.
         </div>
      );
   }

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
               href={`/protectedPages/${companyId}/vehicles/${vehicleId}`}
               className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
               Back to Vehicle
            </Link>
         </div>

         {/* Page Title */}
         <h1 className="text-2xl font-bold">Edit Vehicle</h1>

         {/* Form */}
         <div className="max-w-3xl mx-auto px-6 py-6">
            <EditFormWrapper vehicle={vehicle} companyId={companyId} />
         </div>
      </div>
   );
}
