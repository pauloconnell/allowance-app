import CompanyProvider from '@/components/CompanyProvider';
import { ReactNode } from 'react';

interface CompanyLayoutProps {
   children: ReactNode;
   params: Promise<{ familyId: string }>;
}

export default async function CompanyLayout({ children, params }: CompanyLayoutProps) {
   const { familyId } = await params;

   return (
      <CompanyProvider familyId={familyId}>
         {children}
      </CompanyProvider>
   );
}
