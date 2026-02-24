import { defaultCache } from "@serwist/next/worker";
import {
  Serwist,
  BackgroundSyncQueue,
  NetworkOnly,
  StaleWhileRevalidate,
  NetworkFirst,
  ExpirationPlugin,
  BroadcastUpdatePlugin

} from "serwist";

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

    // AUTH Never cache Auth0 login/callback routes
    // Handlecache the (login) Auth0 session check specifically
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




    {   // ensure dailyRecords always get fresh data if possible
      matcher: ({ url }) => url.pathname.includes("/protectedPages/daily-records"),

      handler: new NetworkFirst({   // hits network before cache
        cacheName: "daily-records-cache",
        plugins: [
          new ExpirationPlugin({ maxEntries: 10 }),
          new BroadcastUpdatePlugin({
            headersToCheck: ["content-length", "etag", "last-modified"],
            // Use the spread and cast to bypass the TypeScript "unknown property" error
            ...({ channelName: "chorepay-updates" } as any),
          }), // Shouts to the UI if data changed
        ]
      }),
    },

    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages-cache",
        plugins: [
          new ExpirationPlugin({ maxEntries: 20 }),
          new BroadcastUpdatePlugin({
            headersToCheck: ["content-length", "etag", "last-modified"],
            // Use the spread and cast to bypass the TypeScript "unknown property" error
            ...({ channelName: "chorepay-updates" } as any),
          }),
        ],
      }),
    },
    // DATA & PAGES: Cache chore lists and pages
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/protectedPages") ||
        url.pathname.includes("/_next/data/"), // Next.js internal data
      handler: new StaleWhileRevalidate({
        cacheName: "app-data-cache",
        plugins: [
          // INVALIDATION LOGIC:
          new ExpirationPlugin({
            maxEntries: 50, // Only keep 50 pages
            maxAgeSeconds: 72 * 60 * 60, // Force a fresh fetch if data is > 3 days old
          }),
          // This is the magic "Shout" button (Broadcast Update)
          new BroadcastUpdatePlugin({
            headersToCheck: ["content-length", "etag", "last-modified"], // Detect changes
            // Use the spread and cast to bypass the TypeScript "unknown property" error
            ...({ channelName: "chorepay-updates" } as any),
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

// Intercept failed POSTs/Actions to your checklist and queue them
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only intercept POST/PUT/PATCH (The "Actions")
  // 2. ONLY for your data routes OR Next.js Server Actions, NOT for Auth0
  const isPost = request.method !== "GET";
  const isServerAction = request.headers.has("next-action");
  const isApiRoute = url.pathname.includes("/api/") && !url.pathname.includes("/api/auth");

  if (isPost && (isApiRoute || isServerAction)) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request.clone());
        } catch (error) {
          // THE NORTH STAR: Save the checkbox/form to the queue
          await queue.pushRequest({ request: request.clone() });


          // Return a 503 to signal "Offline - Action Queued"
          return new Response("Offline", {
            status: 503,
            statusText: "Offline Action Queued"
          });

          // // This specific payload is the "Magic Handshake" for Next.js Server Actions
          // // It says: "Action Success, but stay exactly where you are."
          // return new Response('0:{"action":"done"}\n', {
          //   status: 200,
          //   headers: {
          //     "Content-Type": "text/x-component", // This header is REQUIRED
          //     "X-ChorePay-Offline": "true",
          //   },
          // });
        }
      })()
    );
  }
});

serwist.addEventListeners();