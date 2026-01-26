import { Metadata } from 'next';
import Link from 'next/link';
import { getAllChores } from '@/lib/chores';
import { CardWorkOrder } from '@/components/UI/CardWorkOrder';

export const metadata: Metadata = {
  title: 'Work Orders',
};

export default async function WorkOrdersPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;

  const workOrders = await getAllChores(companyId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold">Work Orders</h1>
          <Link
            href={`/protectedPages/${companyId}/work-orders/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Work Order
          </Link>
        </div>

        {workOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No work orders yet</p>
            <Link
              href={`/protectedPages/${companyId}/work-orders/new`}
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              Create the first one
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {workOrders.map((wo) => (
              // <Link
              //   key={wo._id}
              //   href={`/protectedPages/${companyId}/work-orders/${wo._id}`}
              //   className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              // >
             
              <CardWorkOrder key={wo._id} wo={wo} companyId={companyId} />
              
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
