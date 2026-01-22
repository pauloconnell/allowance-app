'use client';

import WorkOrderForm from '@/components/Forms/WorkOrderForm';
import { IVehicle } from '@/types/IVehicle';

interface WorkOrderEditFormWrapperProps {
  companyId: string;
  workOrderId: string;
  vehicles: IVehicle[];
}

export default function WorkOrderEditFormWrapper({
  companyId,
  workOrderId,
  vehicles,
}: WorkOrderEditFormWrapperProps) {
  return <WorkOrderForm companyId={companyId} workOrderId={workOrderId} vehicles={vehicles} />;
}
