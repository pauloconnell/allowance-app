import VehicleForm from "@/components/Forms/Vehicle/VehicleForm";
import { IVehicle } from "@/types/IVehicle";

export default function EditFormWrapper({ 
   vehicle,
   companyId 
}: {
   vehicle: IVehicle;
   companyId: string;
}) {
   return <VehicleForm vehicle={vehicle} companyId={companyId} />;
}
