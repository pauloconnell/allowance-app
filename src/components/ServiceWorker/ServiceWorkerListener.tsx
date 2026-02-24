
// src/components/ServiceWorkerListener.tsx
"use client";

import { useServiceWorker } from "@/hooks/useServiceWorker";

export function ServiceWorkerListener() {
  const { isOffline } = useServiceWorker();

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center text-xs py-1 z-[9999]">
          You are currently offline. Changes will sync when you reconnect.
        </div>
      )}
    </>
  );
}