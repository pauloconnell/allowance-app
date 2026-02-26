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
const queue = new BackgroundSyncQueue("checklist-updates", {

  onSync: async ({ queue }) => {
    console.log("🚀 Sync starting: Replaying requests...");
    try {
      await queue.replayRequests();
      console.log("✅ Sync complete!");

      // Notify the UI
      const channel = new BroadcastChannel("chorepay-updates");
      channel.postMessage({ meta: "serwist-broadcast-update", forceRefresh: true });
    } catch (err) {
      console.error("❌ Sync replay failed:", err);
    }
  }
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. AUTH (Keep these at the top)
    {
      matcher: ({ url }) => url.pathname === "/api/auth/me",
      handler: new NetworkFirst({ cacheName: "auth-session-cache" }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/auth"),
      handler: new NetworkOnly(),
    },

    // 2. DAILY RECORDS (Specific & High Priority)
    // Switch to NetworkFirst so it's ALWAYS fresh when online
    {
      matcher: ({ url }) => url.pathname.includes("/daily-records"),
      handler: new NetworkFirst({
        cacheName: "daily-records-cache",
        plugins: [
          new ExpirationPlugin({ maxEntries: 20 }),
          new BroadcastUpdatePlugin({
            // Only check ETag for more reliable "shouting"
            headersToCheck: ["etag"],
            ...({ channelName: "chorepay-updates" } as any),
          }),
        ],
      }),
    },

    // 3. NAVIGATION FALLBACK (For other pages)
    {
      matcher: ({ request, url }) => request.mode === "navigate" && !url.pathname.startsWith("/api/auth"),
      handler: new NetworkFirst({
        cacheName: "pages-cache",
        plugins: [
          new ExpirationPlugin({ maxEntries: 20 }),
          new BroadcastUpdatePlugin({
            headersToCheck: ["etag"],
            ...({ channelName: "chorepay-updates" } as any),
          }),
        ],
      }),
    },

    // // 4. GENERAL APP DATA
    // {
    //   matcher: ({ url }) =>
    //     url.pathname.startsWith("/protectedPages") ||
    //     url.pathname.includes("/_next/data/"),
    //   handler: new StaleWhileRevalidate({
    //     cacheName: "app-data-cache",
    //     plugins: [
    //       new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 72 * 60 * 60 }),
    //       new BroadcastUpdatePlugin({
    //         headersToCheck: ["etag"],
    //         ...({ channelName: "chorepay-updates" } as any),
    //       }),
    //     ],
    //   }),
    // },
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


      fetch(request.clone()).catch(async (err) => {
        // This only runs if the network is DOWN
        console.log("📦 Offline: Queuing request for URL:", url.pathname);

        await queue.pushRequest({ request: request.clone() });

        // Manually trigger a sync registration for browsers that support it
        if ("sync" in self.registration) {
          try {
            await (self.registration as any).sync.register("checklist-updates");
          } catch (e) {
            console.log("Sync registration failed (expected in some browsers)");
          }
        }

        // Return the "Fake 200" to keep Next.js happy
        return new Response('0:{"action":"done"}\n', {
          status: 200,
          headers: { "Content-Type": "text/x-component" },
        });
      })

















      // (async () => {
      //   try {
      //     return await fetch(request.clone());
      //   } catch (error) {
      //     // THE NORTH STAR: Save the checkbox/form to the queue
      //     await queue.pushRequest({ request: request.clone() });


      //     // Return a 503 to signal "Offline - Action Queued"
      //     return new Response("Offline", {
      //       status: 503,
      //       statusText: "Offline Action Queued"
      //     });

      //     // // This specific payload is the "Magic Handshake" for Next.js Server Actions
      //     // // It says: "Action Success, but stay exactly where you are."
      //     // return new Response('0:{"action":"done"}\n', {
      //     //   status: 200,
      //     //   headers: {
      //     //     "Content-Type": "text/x-component", // This header is REQUIRED
      //     //     "X-ChorePay-Offline": "true",
      //     //   },
      //     // });
      //   }
      // })()
    );
  }
});

// 4. MANUAL TRIGGER: Kickstart replay if the browser's 'sync' event is lazy
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FORCE_REPLAY") {
    console.log("⚡ Manual Replay Triggered");
    event.waitUntil(queue.replayRequests());
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "checklist-updates") {
    event.waitUntil(queue.replayRequests());
  }
});


serwist.addEventListeners();