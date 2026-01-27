'use client';

import WorkOrderForm from '@/components/Forms/WorkOrderForm';
import { IVehicle } from '@/types/IVehicle';

interface WorkOrderFormWrapperProps {
  familyId: string;
  children: IVehicle[];
}

export default function WorkOrderFormWrapper({ familyId, children }: WorkOrderFormWrapperProps) {
  return <WorkOrderForm familyId={familyId} children={children} />;
}
