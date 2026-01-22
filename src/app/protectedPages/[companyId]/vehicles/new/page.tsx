import Link from "next/link";
import VehicleForm from "@/components/Forms/Vehicle/VehicleForm";

interface Props {
   params: Promise<{ companyId: string }>;
}

export default async function NewVehiclePage({ params }: Props) {
   const { companyId } = await params;

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
         </div>

         {/* Page Title */}
         <h1 className="text-2xl font-bold">Add New Vehicle</h1>

         {/* Form */}
         <div className="max-w-3xl mx-auto px-6 py-6">
            <VehicleForm companyId={companyId} />
         </div>
      </div>
   );
}
