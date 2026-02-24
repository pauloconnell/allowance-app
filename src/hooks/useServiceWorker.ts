// src/hooks/useServiceWorker.ts
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useServiceWorker() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Initial Check
    setIsOffline(!navigator.onLine);

    // 2. Listen for Network Changes
    const setOnline = () => setIsOffline(false);
    const setOffline = () => setIsOffline(true);

    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    // 3. Listen for Serwist Broadcast Updates
    // This matches the "BroadcastUpdatePlugin" in your sw.ts
    const channel = new BroadcastChannel("chorepay-updates");

    channel.onmessage = (event) => {
      // Serwist sends this when it finds new data that differs from the cache
      if (event.data && (event.data.meta === "serwist-broadcast-update" || event.data.meta === "workbox-broadcast-update")) {
        console.log("Serwist: Fresh data received, refreshing UI...");
        const updatedUrl = new URL(event.data.payload.url);



        // 2. Fuzzy Match: Check if the updated URL matches our current path
        // This handles the ?childId=... parameters gracefully
        if (updatedUrl.pathname === window.location.pathname) {
          console.log("ChorePay: Match found! Refreshing data...");
          // 3. App Router way to update data without a hard reload
          // Only try to refresh if we are actually online
          if (navigator.onLine) {
            console.log("ChorePay: Online update detected, refreshing...");
            router.refresh();
          } else {
            console.log("ChorePay: Update queued (offline). Skipping refresh.");
          }
        }
      }
    };

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
      channel.close();
    };
  }, [router, pathname]);

  return { isOffline };
}