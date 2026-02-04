// components/FamilyStoreInitializer.tsx


// server gets data, passes as prop to this component to initialize zustand store
'use client';

import { useRef } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { IChild } from '@/types/IChild';

export default function FamilyStoreInitializer({ 
  children, 
  familyId 
}: { 
  children: IChild[], 
  familyId: string 
}) {
 const initialized = useRef(false);
  const setChildren = useFamilyStore((s) => s.setChildren);
  const setActiveFamilyId = useFamilyStore((s) => s.setActiveFamilyId);

  // We do this during the render phase so it's ready 
  // by the time the rest of the children components mount.
  if (!initialized.current) {
    setChildren(children);
    setActiveFamilyId(familyId);
    initialized.current = true;
  }

  return null;
}