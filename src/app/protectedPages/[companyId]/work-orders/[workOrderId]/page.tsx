import { Metadata } from 'next';
import WorkOrderEditFormWrapper from './edit/WorkOrderEditFormWrapper';
import { getAllVehicles } from '@/lib/vehicles';

export const metadata: Metadata = {
  title: 'Work Order Details',
};

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; workOrderId: string }>;
}) {
  const { companyId, workOrderId } = await params;

  const vehicles = await getAllVehicles(companyId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-8">Work Order Details</h1>
        <WorkOrderEditFormWrapper companyId={companyId} workOrderId={workOrderId} vehicles={vehicles} />
      </div>
    </div>
  );
}
