// components/ServiceWorker/CacheUpdateListener.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Remove { children } from the function arguments
export function CacheUpdateListener() {
   const router = useRouter();

   useEffect(() => {
      if ('serviceWorker' in navigator) {
         // 1. REGISTER the worker (This is the "Offline Engine" switch)
         navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => {
               console.log('Service Worker active at scope:', reg.scope);
            })
            .catch((err) => {
               console.error('Service Worker registration failed:', err);
            });

         // 2. LISTEN for the 'Broadcast Update' shout
         const handleMessage = (event: MessageEvent) => {
            // Serwist BroadcastUpdatePlugin sends 'CACHE_UPDATED'
            if (event.data && event.data.meta === 'serwist-broadcast-update') {
               console.log('New data from server! Refreshing...');
               router.refresh();
            }
         };

         navigator.serviceWorker.addEventListener('message', handleMessage);
         return () =>
            navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
   }, [router]);

   return null; // It stays invisible
}
