import { redirect } from 'next/navigation';

export default function RecordServicePage() {
  // This route is deprecated - redirect to company-scoped version
  redirect('/protectedPages');
}

