import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to enforce company membership gatekeeper
 * - If user is authenticated but has no company, redirect to /setup-company
 * - Allow access to setup-company and API routes without company check
 */
export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
   const pathname = req.nextUrl.pathname;
   const res = NextResponse.next();

// 1. "Touch" the session. This handles session rolling/refresh 
   // and prevents the "Set Cookie" error in Server Components.
   const session = await getSession(req, res);

   // Allow these paths without company check
   const allowedPaths = [
      '/setup-company',
      '/api/auth', // Auth0 callbacks
      '/api/companies', // Company creation endpoint (if added later)
      '/public',
   ];

   const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));
   if (isAllowedPath) {
      return NextResponse.next();
   }

   // For protected pages, we'll check company membership in the layout/page
   // The server can access the session and check UserCompany records
   return NextResponse.next();
});

export const config = {
   matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - public (public folder)
       */
      '/((?!_next/static|_next/image|favicon.ico|public).*)',
   ],
};
