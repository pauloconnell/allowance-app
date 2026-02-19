'use client';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast'; // or your toast lib

export function EndDateToast({ endDate }: { endDate: string }) {
   const prev = useRef(endDate);

   useEffect(() => {
      if (prev.current !== endDate) {
         toast.success(`Great!  This penalty ends today: ${endDate}`, {
            duration: 6000, // 6 seconds
            position: "top-left",
         });
         prev.current = endDate;
      }
   }, [endDate]);

   return null; // nothing to render
}
