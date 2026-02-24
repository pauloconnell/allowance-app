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
    const setOnline = async () => {
      setIsOffline(false);

      // Get the SW registration and send the kick
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        console.log("📡 Network back! Forcing SW Replay...");
        registration.active.postMessage({ type: "FORCE_REPLAY" });
      }
    };
   
    const setOffline = () => setIsOffline(true);

  window.addEventListener("online", setOnline);
  window.addEventListener("offline", setOffline);

  // 3. Listen for Serwist Broadcast Updates
  // This matches the "BroadcastUpdatePlugin" in your sw.ts
  const channel = new BroadcastChannel("chorepay-updates");

  channel.onmessage = (event) => {
  console.log("📢 Broadcast received:", event.data);

  // 1. Check if it's a Serwist/Workbox message
  const isSerwist = event.data?.meta === "serwist-broadcast-update" || event.data?.meta === "workbox-broadcast-update";
  
  if (isSerwist) {
    // 2. PRIORITY: If it's a Background Sync completion, REFRESH NOW
    if (event.data.forceRefresh) {
      console.log("ChorePay: Sync complete! Forcing global refresh.");
      router.refresh();
      return;
    }

    // 3. SECONDARY: Standard Cache Update (Your Fuzzy Match logic)
    if (event.data.payload?.url) {
      try {
        const updatedUrl = new URL(event.data.payload.url);
        
        if (updatedUrl.pathname === pathname) {
          console.log("ChorePay: Match found! Refreshing data...");
          
          if (navigator.onLine) {
            router.refresh();
          } else {
            console.log("ChorePay: Update queued (offline). Skipping refresh.");
          }
        }
      } catch (e) {
        console.error("Error parsing broadcast URL", e);
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