import { handleAuth, handleLogin, handleCallback } from "@auth0/nextjs-auth0";

export const dynamic = 'force-dynamic';

export const GET = handleAuth({
  // 1. Force a clean login flow
  login: handleLogin({
    authorizationParams: {
      prompt: "login", // Forces the user to see the Auth0 login screen (avoids zombie sessions)
    },
    returnTo: "/", 
  }),

  // 2. Handle the "Stale" Callback error gracefully
  callback: async (req: any, res: any) => {
    try {
      return await handleCallback(req, res);
    } catch (error: any) {
      // If the session is stale or the 'state' is mismatched, 
      // instead of crashing, we kick them back to the login to start fresh.
      console.error("Auth0 Callback Error:", error.message);
      const baseUrl = process.env.AUTH0_BASE_URL!;
      return Response.redirect(new URL("/api/auth/login", baseUrl));
    }
  },
});

export const POST = handleAuth();