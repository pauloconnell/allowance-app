// components/FamilyStoreInitializer.tsx

// server gets data, passes as prop to this component to initialize zustand store
'use client';

import { useRef } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { IChild } from '@/types/IChild';

export default function FamilyStoreInitializer({
   children,
   familyId,
}: {
   children: IChild[];
   familyId: string;
}) {
   const initialized = useRef(false);

   const setActiveFamilyId = useFamilyStore((s) => s.setActiveFamilyId);
   const setChildren = useFamilyStore((s) => s.setChildren);

   // We do this during the render phase so it's ready
   // by the time the rest of the children components mount.
   if (!initialized.current) {    // this will run a) syncronously -before useEffect would b) avoids double render 'use strict' causes
      setChildren(children);
      setActiveFamilyId(familyId);
      initialized.current = true; // ref ensures we don't refetch on every re-render
   }

   return null;
}
