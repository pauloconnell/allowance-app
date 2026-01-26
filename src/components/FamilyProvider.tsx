'use client';

import { useFamilyStore } from '@/store/useFamilyStore';
import { useEffect } from 'react';

/**
 * FamilyProvider: Initializes activefamilyId in the store
 * Place this at the [familyId] route level to ensure all child components
 * have access to the active company context
 */
export default function FamilyProvider({
   children,
   familyId,
}: {
   children: React.ReactNode;
   familyId: string;
}) {
   useEffect(() => {
      useFamilyStore.setState({ activefamilyId: familyId });
   }, [familyId]);

   return <>{children}</>;
}
