/**
 * COMPANY CONTEXT PERSISTENCE STRATEGY
 * 
 * Options for managing "Active Company" in a multi-tenant app
 */

/**
 * STRATEGY 1: URL Parameter (Recommended)
 * =====================================
 * 
 * Pattern: /[companyId]/dashboard, /[companyId]/vehicles, etc.
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
 * - Restructure app routes to include [companyId] param
 * - Update all navigation to include companyId
 * - Use searchParams as fallback for other routes
 * 
 * 
 * STRATEGY 2: Query Parameter (Current Approach)
 * ==========================================
 * 
 * Pattern: /dashboard?companyId=123, /vehicles?companyId=123
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
 * - Pass companyId in all navigation
 * - Store in URL searchParams
 * - Client components can read from useSearchParams()
 * 
 * 
 * STRATEGY 3: Cookie (Session-based)
 * ===============================
 * 
 * Pattern: Store activeCompanyId in httpOnly cookie
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
 * - Always include companyId in URL params
 * - Store in cookie for convenience
 * - Middleware checks: param > cookie > redirect to choose
 * 
 * 
 * RECOMMENDED: URL Parameter Strategy (Evolving to Strategy 1)
 * ===========================================================
 * 
 * Phase 1 (Now): Use query params with createCompany redirect
 * - Minimal changes, fast to implement
 * - createCompany redirects to /dashboard?companyId=123
 * 
 * Phase 2 (Future): Migrate to [companyId] route groups
 * - Cleaner architecture
 * - Better multi-tenant isolation
 * - More professional URLs
 * 
 * Current Implementation:
 * - createCompany() redirects to /dashboard?companyId={id}
 * - Layouts/pages read companyId from searchParams
 * - API routes require companyId param/body
 * - getUserCompanies() helps user choose company
 */

import { IFamily } from '@/types/IFamily';

/**
 * Helper: Get active company from request context
 * Works in both client and server components
 */
export function getActiveCompanyId(
   searchParams?: Record<string, string | string[] | undefined>
): string | null {
   if (!searchParams) return null;

   const companyId = searchParams.companyId;
   if (typeof companyId === 'string') {
      return companyId;
   }
   return null;
}

/**
 * Future: Helper for cookie-based active company
 * Once implemented with middleware support
 */
export async function setActiveCompanyId(companyId: string): Promise<void> {
   // Implementation: Set httpOnly cookie via server action
   // await fetch('/api/company/set-active', {
   //   method: 'POST',
   //   body: JSON.stringify({ companyId }),
   // });
}

/**
 * Future: Get company switcher component
 * Shows all user's companies and allows switching
 */
export interface CompanySwitcherProps {
   companies: (IFamily & { role: string })[];
   activeCompanyId: string;
   onSwitch: (companyId: string) => void;
}

/**
 * Migration Notes for Route Groups:
 * 
 * From: /dashboard, /vehicles, /work-orders
 * To:   /[companyId]/dashboard, /[companyId]/vehicles, /[companyId]/work-orders
 * 
 * Steps:
 * 1. Create [companyId] route group in app/protectedPages
 * 2. Move dashboard/, vehicles/, work-orders/ inside
 * 3. Update all links to include [companyId]
 * 4. Update API calls to include companyId param
 * 5. Update middleware to validate company access
 * 
 * This provides:
 * - Clear tenant isolation at route level
 * - Type-safe company context
 * - Better DX with automatic companyId availability
 */
