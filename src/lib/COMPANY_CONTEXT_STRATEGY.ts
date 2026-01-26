/**
 * COMPANY CONTEXT PERSISTENCE STRATEGY
 * 
 * Options for managing "Active Company" in a multi-tenant app
 */

/**
 * STRATEGY 1: URL Parameter (Recommended)
 * =====================================
 * 
 * Pattern: /[familyId]/dashboard, /[familyId]/vehicles, etc.
 * 
 * Pros:
 * - Clean separation of routes by company
 * - Easy to share links with company context
 * - Bookmarks preserve company context
 * - No session/cookie issues
 * - Explicit and auditable
 * 
 * Cons:
 * - More complex routing structure
 * - Requires route refactoring
 * 
 * Implementation:
 * - Restructure app routes to include [familyId] param
 * - Update all navigation to include familyId
 * - Use searchParams as fallback for other routes
 * 
 * 
 * STRATEGY 2: Query Parameter (Current Approach)
 * ==========================================
 * 
 * Pattern: /dashboard?familyId=123, /vehicles?familyId=123
 * 
 * Pros:
 * - Minimal routing changes needed
 * - Easy to implement
 * - Can work alongside URL structure
 * - Fast implementation
 * 
 * Cons:
 * - Can be lost on redirects
 * - Less clean URLs
 * - Users must include param in bookmarks
 * - Can be forgotten when navigating
 * 
 * Implementation:
 * - Pass familyId in all navigation
 * - Store in URL searchParams
 * - Client components can read from useSearchParams()
 * 
 * 
 * STRATEGY 3: Cookie (Session-based)
 * ===============================
 * 
 * Pattern: Store activefamilyId in httpOnly cookie
 * 
 * Pros:
 * - Persistent across navigations
 * - User doesn't see in URL
 * - Can be secure (httpOnly)
 * - Good for "remember this choice"
 * 
 * Cons:
 * - Requires middleware/server action to set
 * - Can cause issues with multi-company workflows
 * - Users can't easily share links with context
 * - Requires cookie consent
 * 
 * Implementation:
 * - Create setActiveCompany() server action
 * - Store in httpOnly cookie
 * - Read in middleware or layout
 * 
 * 
 * STRATEGY 4: Hybrid Approach (Best Practice)
 * ==========================================
 * 
 * Use both URL params AND cookie fallback
 * 
 * Pros:
 * - Best user experience
 * - Links are explicit and shareable
 * - Fallback to saved preference if param missing
 * - Flexible
 * 
 * Implementation:
 * - Always include familyId in URL params
 * - Store in cookie for convenience
 * - Middleware checks: param > cookie > redirect to choose
 * 
 * 
 * RECOMMENDED: URL Parameter Strategy (Evolving to Strategy 1)
 * ===========================================================
 * 
 * Phase 1 (Now): Use query params with createCompany redirect
 * - Minimal changes, fast to implement
 * - createCompany redirects to /dashboard?familyId=123
 * 
 * Phase 2 (Future): Migrate to [familyId] route groups
 * - Cleaner architecture
 * - Better multi-tenant isolation
 * - More professional URLs
 * 
 * Current Implementation:
 * - createCompany() redirects to /dashboard?familyId={id}
 * - Layouts/pages read familyId from searchParams
 * - API routes require familyId param/body
 * - getUserCompanies() helps user choose company
 */

import { IFamily } from '@/types/IFamily';

/**
 * Helper: Get active company from request context
 * Works in both client and server components
 */
export function getActivefamilyId(
   searchParams?: Record<string, string | string[] | undefined>
): string | null {
   if (!searchParams) return null;

   const familyId = searchParams.familyId;
   if (typeof familyId === 'string') {
      return familyId;
   }
   return null;
}

/**
 * Future: Helper for cookie-based active company
 * Once implemented with middleware support
 */
export async function setActivefamilyId(familyId: string): Promise<void> {
   // Implementation: Set httpOnly cookie via server action
   // await fetch('/api/company/set-active', {
   //   method: 'POST',
   //   body: JSON.stringify({ familyId }),
   // });
}

/**
 * Future: Get company switcher component
 * Shows all user's companies and allows switching
 */
export interface CompanySwitcherProps {
   companies: (IFamily & { role: string })[];
   activefamilyId: string;
   onSwitch: (familyId: string) => void;
}

/**
 * Migration Notes for Route Groups:
 * 
 * From: /dashboard, /vehicles, /work-orders
 * To:   /[familyId]/dashboard, /[familyId]/vehicles, /[familyId]/work-orders
 * 
 * Steps:
 * 1. Create [familyId] route group in app/protectedPages
 * 2. Move dashboard/, vehicles/, work-orders/ inside
 * 3. Update all links to include [familyId]
 * 4. Update API calls to include familyId param
 * 5. Update middleware to validate company access
 * 
 * This provides:
 * - Clear tenant isolation at route level
 * - Type-safe company context
 * - Better DX with automatic familyId availability
 */
