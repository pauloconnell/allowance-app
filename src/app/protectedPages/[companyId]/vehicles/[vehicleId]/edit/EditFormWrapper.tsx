import VehicleForm from "@/components/Forms/Vehicle/VehicleForm";
import { IVehicle } from "@/types/IVehicle";

export default function EditFormWrapper({ 
   vehicle,
   familyId 
}: {
   vehicle: IVehicle;
   familyId: string;
}) {
   return <VehicleForm vehicle={vehicle} familyId={familyId} />;
}
