import { Metadata } from 'next';
import WorkOrderFormWrapper from './WorkOrderFormWrapper';
import { getAllChildren } from '@/lib/data/childService';

export const metadata: Metadata = {
  title: 'Create Work Order',
};

export default async function NewWorkOrderPage({ params }: { params: Promise<{ familyId: string }> }) {
  const { familyId: familyId } = await params;

  const children = await getAllChildren(familyId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-8">Create Work Order</h1>
        <WorkOrderFormWrapper familyId={familyId} children={children} />
      </div>
    </div>
  );
}
