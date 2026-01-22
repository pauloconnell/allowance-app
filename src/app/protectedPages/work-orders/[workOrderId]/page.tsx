import { redirect } from 'next/navigation';

export default function WorkOrderDetailPage() {
  // This route is deprecated - redirect to company-scoped version
  redirect('/protectedPages');
}

