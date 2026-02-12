import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';
import { getUserRoles } from '@/lib/access-control/childAccess';

/**
 * Middleware to enforce company membership gatekeeper
 */
export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
   const pathname = req.nextUrl.pathname;
   const res = NextResponse.next();

   // 1. "Touch" the session to handle rolling/refresh
   const session = await getSession(req, res);

   // 2. Allow specific internal paths that are NOT caught by the matcher
   // (Like /setup-company or /public assets)
   const allowedPaths = [
      '/setup-family',
      '/public',
   ];

   const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));
   if (isAllowedPath) {
      return res;
   }

// 2. RBAC Redirect Logic
   if (pathname === '/') {
      const user = session?.user;

      if(user){
         //get rbac -> kids go right to daily records
      //   let role = getUserRoles(user.id)
         //TODO: Implement 

      }
   }


   // For protected pages, you can now safely proceed
   return res;
});

export const config = {
   matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api/auth (Auth0 login/callback/logout) <--- THIS IS THE KEY FIX
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - public (public folder)
       */
      '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
   ],
};