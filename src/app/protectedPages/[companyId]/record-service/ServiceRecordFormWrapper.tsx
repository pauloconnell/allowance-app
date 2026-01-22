'use client';

import ServiceRecordForm from '@/components/Forms/ServiceRecordForm';

interface ServiceRecordFormWrapperProps {
  companyId: string;
  vehicleId?: string;
}

export default function ServiceRecordFormWrapper({ companyId, vehicleId }: ServiceRecordFormWrapperProps) {
  return <ServiceRecordForm companyId={companyId} vehicleId={vehicleId} />;
}
