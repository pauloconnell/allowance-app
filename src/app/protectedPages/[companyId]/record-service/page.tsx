import { Metadata } from 'next';
import ServiceRecordFormWrapper from './ServiceRecordFormWrapper';

export const metadata: Metadata = {
  title: 'Record Service',
};

export default async function RecordServicePage({ params }: { params: Promise<{ familyId: string }> }) {
  const { familyId } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-8">Record Service</h1>
        <ServiceRecordFormWrapper familyId={familyId} />
      </div>
    </div>
  );
}
