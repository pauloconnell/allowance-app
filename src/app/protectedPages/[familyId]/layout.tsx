import FamilyProvider from '@/components/FamilyProvider';
import { ReactNode } from 'react';

interface FamilyLayoutProps {
   children: ReactNode;
   params: Promise<{ familyId: string }>;
}

export default async function FamilyLayout({ children, params }: FamilyLayoutProps) {
   const { familyId } = await params;

   return (
      <FamilyProvider familyId={familyId}>
         {children}
      </FamilyProvider>
   );
}
