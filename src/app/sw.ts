import { defaultCache } from "@serwist/next/worker";
import { Serwist, BackgroundSyncQueue, NetworkOnly, StaleWhileRevalidate } from "serwist";
import { ExpirationPlugin, BroadcastUpdatePlugin } from "serwist";

// keep typescript happy:
declare const self: ServiceWorkerGlobalScope;
declare global {
  interface ServiceWorkerGlobalScope {
    __SW_MANIFEST: (string | { url: string; revision: string })[];
  }
}


// The "North Star": Queue failed API requests serwist will handle
const queue = new BackgroundSyncQueue("checklist-updates");

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
   runtimeCaching: [
    // !!! ADD THIS: Never cache Auth0 login/callback routes
     // Handle the Auth0 session check specifically
    {
      matcher: ({ url }) => url.pathname === "/api/auth/me",
      handler: new StaleWhileRevalidate({
        cacheName: "auth-session-cache",
      }),
    },
     // Ignore all other Auth routes (Login/Logout/Callback)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/auth"),
      handler: new NetworkOnly(),
    },


    {
      matcher: ({ url }) => url.pathname.startsWith("/protectedPages"),
      // 3. Change from "StaleWhileRevalidate" to new StaleWhileRevalidate()
      handler: new StaleWhileRevalidate({
        cacheName: "pages-cache",
        plugins: [
          // INVALIDATION LOGIC:
          new ExpirationPlugin({
            maxEntries: 50,           // Only keep 50 pages
            maxAgeSeconds: 72 * 60 * 60,   // Force a fresh fetch if data is > 3 days old
          }),
             // This is the magic "Shout" button
          new BroadcastUpdatePlugin({
            headersToCheck: ["content-length", "etag"], // Detect changes
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});



// Intercept failed POSTs to your checklist API and queue them
self.addEventListener("fetch", (event) => {
   const { url, method } = event.request;

  // 1. Only intercept POST/PUT/PATCH (The "Actions")
  // 2. ONLY for your data routes, NOT for Auth0
  if (
    method !== "GET" && 
    url.includes("/api/") && 
    !url.includes("/api/auth")
  ) {
    event.respondWith(
      (async () => {
         try {
          return await fetch(event.request.clone());
        } catch (error) {
          // THE NORTH STAR: Save the checkbox/form to the queue
          await queue.pushRequest({ request: event.request });

          // THE SAVE: Tell React "Everything is fine"
          return new Response(JSON.stringify({ offline: true }), {
            status: 202,
            headers: { "Content-Type": "application/json" },
          });
        }
      })()
    );
  }
});

serwist.addEventListeners();
