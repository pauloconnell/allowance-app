'use client';

import ServiceRecordForm from '@/components/Forms/ServiceRecordForm';

interface ServiceRecordFormWrapperProps {
  familyId: string;
  childId?: string;
}

export default function ServiceRecordFormWrapper({ familyId, childId }: ServiceRecordFormWrapperProps) {
  return <ServiceRecordForm familyId={familyId} childId={childId} />;
}
