import { Metadata } from 'next';
import WorkOrderEditFormWrapper from './edit/WorkOrderEditFormWrapper';
import { getAllChildren } from '@/lib/data/childService';

export const metadata: Metadata = {
  title: 'Work Order Details',
};

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ familyId: string; workOrderId: string }>;
}) {
  const { familyId, workOrderId } = await params;

  const vehicles = await getAllChildren(familyId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-8">Work Order Details</h1>
        <WorkOrderEditFormWrapper familyId={familyId} workOrderId={workOrderId} vehicles={vehicles} />
      </div>
    </div>
  );
}
