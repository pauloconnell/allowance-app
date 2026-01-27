'use client';

import WorkOrderForm from '@/components/Forms/WorkOrderForm';
import { IVehicle } from '@/types/IVehicle';

interface WorkOrderEditFormWrapperProps {
  familyId: string;
  workOrderId: string;
  children: IVehicle[];
}

export default function WorkOrderEditFormWrapper({
  familyId,
  workOrderId,
  children,
}: WorkOrderEditFormWrapperProps) {
  return <WorkOrderForm familyId={familyId} workOrderId={workOrderId} children={children} />;
}
