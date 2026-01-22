'use client';

import WorkOrderForm from '@/components/Forms/WorkOrderForm';
import { IVehicle } from '@/types/IVehicle';

interface WorkOrderFormWrapperProps {
  companyId: string;
  vehicles: IVehicle[];
}

export default function WorkOrderFormWrapper({ companyId, vehicles }: WorkOrderFormWrapperProps) {
  return <WorkOrderForm companyId={companyId} vehicles={vehicles} />;
}
