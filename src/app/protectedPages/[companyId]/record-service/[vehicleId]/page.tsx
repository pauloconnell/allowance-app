import { Metadata } from 'next';
import ServiceRecordFormWrapper from '../ServiceRecordFormWrapper';

export const metadata: Metadata = {
  title: 'Record Service',
};

export default async function RecordServiceDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; vehicleId: string }>;
}) {
  const { companyId, vehicleId } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-8">Record Service</h1>
        <ServiceRecordFormWrapper companyId={companyId} vehicleId={vehicleId} />
      </div>
    </div>
  );
}
