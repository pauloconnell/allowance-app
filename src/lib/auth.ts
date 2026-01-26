import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Session context extracted from Auth0
 */
export interface SessionContext {
   userId: string;
   email: string;
}

/**
 * Auth + Family context for API routes
 */
export interface AuthContext {
   session: SessionContext;
   familyId: string;
}

/**
 * Extract Auth0 session from request
 * Returns null if not authenticated
 */
export async function getAuthSession(req?: NextRequest): Promise<SessionContext | null> {
   try {
      const session =req ? await getSession(req, new NextResponse()) : await getSession();
      if (!session?.user) return null;

      return {
         userId: session.user.sub || session.user.email,
         email: session.user.email,
      };
   } catch (error) {
      console.error('Failed to get session:', error);
      return null;
   }
}

/**
 * Verify Auth0 session and family membership
 * Throws error or returns null response if not authorized
 */
export async function requireAuthAndFamily(familyId: string) {
   const session = await getAuthSession();

   if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   if (!familyId) {
      return NextResponse.json({ error: 'Missing family context' }, { status: 400 });
   }

   return null; // Success - caller should proceed
}

/**
 * Backward compatibility alias
 */
export const requireAuthAndCompany = requireAuthAndFamily;

/**
 * Create error response for authorization failures
 */
export function unauthorizedResponse(message = 'Unauthorized') {
   return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Create error response for authentication failures
 */
export function unauthenticatedResponse(message = 'Authentication required') {
   return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Create error response for validation failures
 */
export function validationErrorResponse(message = 'Validation failed') {
   return NextResponse.json({ error: message }, { status: 400 });
}
