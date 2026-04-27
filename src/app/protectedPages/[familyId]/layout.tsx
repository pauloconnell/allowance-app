import FamilyProvider from '@/components/FamilyProvider';
import { ReactNode } from 'react';
import { TabBar } from '@/components/TabBar/TabBar';


interface FamilyLayoutProps {
   children: ReactNode;
   params: { familyId: string };
}

export default async function FamilyLayout({ children, params }: FamilyLayoutProps) {
   const { familyId } = params;

   return (
      <FamilyProvider familyId={familyId}>

        <div className="min-h-screen flex flex-col">
         <TabBar familyId={familyId} />

         <main className="flex-1">
          {children}
        </main>
      </div>
      </FamilyProvider>
   );
}
