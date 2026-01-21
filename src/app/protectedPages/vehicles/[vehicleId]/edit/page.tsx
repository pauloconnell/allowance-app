import Link from "next/link";
import { getVehicleById } from "@/lib/vehicles";
//import VehicleForm from "@/components/Vehicle/VehicleForm";
import EditFormWrapper from "./EditFormWrapper";
import mongoose from "mongoose";
import { toast } from "react-hot-toast";

export default async function EditVehiclePage({ params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = await params;

 if (!mongoose.isValidObjectId(vehicleId)) {
     toast.error('failed to load data, this vehicleid is in correct, please try again')
   }

  let vehicle = null;
   try{
// Fetch vehicle from DB (lean() returns plain object)
  const doc = await getVehicleById(vehicleId);

  // Extra safety: ensure fully JSON-serializable
  vehicle = JSON.parse(JSON.stringify(doc));

   }catch(err){
  toast.error('failed to load data for this vehicleid. Please go back to Dashboard.')
   }
  


  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex justify-between items-center mb-6 mt-3 mx-6">
        <Link
          href={`/protectedPages/vehicles/${vehicleId}`}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Back to Vehicle
        </Link>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold">Edit Vehicle</h1>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <EditFormWrapper vehicle={vehicle}  />
      </div>
    </div>
  );
}
