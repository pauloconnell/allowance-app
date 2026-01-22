import { redirect } from 'next/navigation';

export default function NewWorkOrderPage() {
  // This route is deprecated - redirect to company-scoped version
  redirect('/protectedPages');
}

