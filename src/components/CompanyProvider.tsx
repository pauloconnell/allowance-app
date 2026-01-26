'use client';

import { useCompanyStore } from '@/store/useCompanyStore';
import { useEffect } from 'react';

/**
 * CompanyProvider: Initializes activefamilyId in the store
 * Place this at the [familyId] route level to ensure all child components
 * have access to the active company context
 */
export default function CompanyProvider({
   children,
   familyId,
}: {
   children: React.ReactNode;
   familyId: string;
}) {
   useEffect(() => {
      useCompanyStore.setState({ activefamilyId: familyId });
   }, [familyId]);

   return <>{children}</>;
}
