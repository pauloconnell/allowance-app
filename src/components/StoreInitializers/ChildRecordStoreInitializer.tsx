// components/RecordStoreInitializer.tsx

// server gets data, passes as prop to this component to initialize zustand store
'use client';

import { useRef, useEffect } from 'react';
import { useChildRecordStore } from '@/store/useChildRecordStore';
import { IChild } from '@/types/IChild';
import { IDailyRecord } from '@/types/IDailyRecord';
import { toast } from 'react-hot-toast';


export default function ChildRecordStoreInitializer({
   childId,
   familyId,
   records,
   errorMessage,
   
}: {
   childId: string;
   familyId: string;
   records: IDailyRecord[];
   errorMessage?: string; // page can pass error message if data fetch failed so this client component can fire Toast 4 user
}) {
   const initialized = useRef(false);

   const setActiveFamilyId = useChildRecordStore((s) => s.setFamilyId);
   const setChildId = useChildRecordStore((s) => s.setChildId);
   const setAllRecords = useChildRecordStore((s) => s.setAllRecords);

   // We do this during the render phase so it's ready
   // by the time the rest of the children components mount.
   if (!initialized.current) {
      // this will run a) syncronously -before useEffect would b) avoids double render 'use strict' causes
      setChildId(childId);
      setActiveFamilyId(familyId);
      setAllRecords(records);
      initialized.current = true; // ref ensures we don't refetch on every re-render
   }

   // Fire toast AFTER render phase to avoid SSR issues
   useEffect(() => {
      if (errorMessage) {
         toast.error(errorMessage);
      }
   }, [errorMessage]);
   //    // Fire toast AFTER render phase to avoid SSR issues
   // useEffect(() => {
   //    if (successMessage) {
   //       toast.success(successMessage);
   //    }
   // }, [successMessage]);

   return null;
}
