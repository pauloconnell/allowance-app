'use client';

import { useCompanyStore } from '@/store/useCompanyStore';
import { useEffect } from 'react';

/**
 * CompanyProvider: Initializes activeCompanyId in the store
 * Place this at the [companyId] route level to ensure all child components
 * have access to the active company context
 */
export default function CompanyProvider({
   children,
   companyId,
}: {
   children: React.ReactNode;
   companyId: string;
}) {
   useEffect(() => {
      useCompanyStore.setState({ activeCompanyId: companyId });
   }, [companyId]);

   return <>{children}</>;
}
