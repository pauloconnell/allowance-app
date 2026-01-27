import Link from "next/link";
import { getChildById } from "@/lib/children";
import EditFormWrapper from "./EditFormWrapper";
import mongoose from "mongoose";

interface Props {
   params: Promise<{ familyId: string; vehicleId: string }>;
}

export default async function EditVehiclePage({ params }: Props) {
   const { familyId, vehicleId } = await params;

   if (!mongoose.isValidObjectId(vehicleId)) {
      return (
         <div className="text-red-600 p-6">
            Invalid child ID format
         </div>
      );
   }

   let vehicle = null;
   try {
      // Fetch child from DB with family scope
      const doc = await getChildById(vehicleId, familyId);
      vehicle = JSON.parse(JSON.stringify(doc));
   } catch (err) {
      console.error('Failed to load child:', err);
      return (
         <div className="text-red-600 p-6">
            Failed to load child. Please try again.
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
               href={`/protectedPages/${familyId}/vehicles/${vehicleId}`}
               className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
               Back to Vehicle
            </Link>
         </div>

         {/* Page Title */}
         <h1 className="text-2xl font-bold">Edit Vehicle</h1>

         {/* Form */}
         <div className="max-w-3xl mx-auto px-6 py-6">
            <EditFormWrapper vehicle={vehicle} familyId={familyId} />
         </div>
      </div>
   );
}
