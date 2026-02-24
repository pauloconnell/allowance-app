// src/components/ServiceWorkerListener.tsx
"use client";

import { useServiceWorker } from "@/hooks/useServiceWorker";

export function ServiceWorkerListener() {
  // This initializes the BroadcastChannel listener and the router.refresh() logic
  useServiceWorker(); 
  return null; // This component doesn't render anything
}