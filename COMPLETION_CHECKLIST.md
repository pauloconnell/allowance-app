/**
 * COMPLETION CHECKLIST - Multi-Tenant Refactoring
 * 
 * Tasks to complete the [companyId] route migration and API integration
 */

// ============================================================================
// PHASE 2: ROUTE MIGRATION
// ============================================================================

// [ ] Task 1: Move /vehicles under /[companyId]
//     Files to create:
//     - /protectedPages/[companyId]/vehicles/page.tsx
//     - /protectedPages/[companyId]/vehicles/[vehicleId]/page.tsx
//     - /protectedPages/[companyId]/vehicles/[vehicleId]/edit/page.tsx
//     - /protectedPages/[companyId]/vehicles/new/page.tsx
//
//     Each should:
//     - Accept params: Promise<{ companyId: string; vehicleId?: string }>
//     - Pass companyId to client components as prop
//     - Update navigation links to include [companyId]

// [ ] Task 2: Move /work-orders under /[companyId]
//     Files to create:
//     - /protectedPages/[companyId]/work-orders/page.tsx
//     - /protectedPages/[companyId]/work-orders/[workOrderId]/page.tsx
//     - /protectedPages/[companyId]/work-orders/new/page.tsx
//
//     Each should:
//     - Accept params and extract companyId
//     - Initialize store with activeCompanyId
//     - Pass companyId to forms/lists

// [ ] Task 3: Move /record-service under /[companyId]
//     Files to create:
//     - /protectedPages/[companyId]/record-service/page.tsx
//     - /protectedPages/[companyId]/record-service/[vehicleId]/page.tsx

// ============================================================================
// PHASE 2B: UPDATE OLD ROUTE REDIRECTS (if any)
// ============================================================================

// [ ] Task 4: Add redirect middleware or layout
//     Old URLs like /vehicles should redirect to /[companyId]/vehicles
//     Could use middleware to catch old patterns and redirect

// ============================================================================
// PHASE 3: CLIENT COMPONENT UPDATES
// ============================================================================

// [ ] Task 5: Update VehicleList component
//     Changes:
//     - Accept companyId prop: string
//     - Use in fetch: `/api/vehicles?companyId=${companyId}`
//     - Initialize store: useCompanyStore.setState({ activeCompanyId: companyId })
//
//     File: /src/components/vehicle/VehicleList.tsx

// [ ] Task 6: Update WorkOrderForm component
//     Changes:
//     - Accept companyId prop: string
//     - Include in form submission: { ...formData, companyId }
//     - Update POST/PUT calls to include companyId
//
//     File: /src/components/Forms/WorkOrderForm/index.tsx

// [ ] Task 7: Update ServiceRecordForm component
//     Changes:
//     - Accept companyId prop: string
//     - Include in form submission: { ...formData, companyId }
//     - Update API calls
//
//     File: /src/components/Forms/ServiceRecordForm/index.tsx

// [ ] Task 8: Update VehicleForm component
//     Changes:
//     - Accept companyId prop: string
//     - Include in form submission: { ...formData, companyId }
//     - Update API calls
//
//     File: /src/components/Forms/Vehicle/VehicleForm.tsx

// ============================================================================
// PHASE 4: STORE INITIALIZATION
// ============================================================================

// [ ] Task 9: Create CompanyProvider/Wrapper
//     Create: /src/app/protectedPages/[companyId]/layout.tsx or use root wrapper
//     
//     This component should:
//     - Accept params.companyId
//     - Initialize useCompanyStore.setState({ activeCompanyId: companyId })
//     - Ensure all child components have active company context
//
//     Pattern:
//     ```tsx
//     'use client';
//     import { useCompanyStore } from '@/store/useCompanyStore';
//     import { useEffect } from 'react';
//     
//     export default function CompanyProvider({ 
//        children, 
//        companyId 
//     }: { 
//        children: React.ReactNode;
//        companyId: string;
//     }) {
//        useEffect(() => {
//           useCompanyStore.setState({ activeCompanyId: companyId });
//        }, [companyId]);
//        
//        return children;
//     }
//     ```

// ============================================================================
// PHASE 5: API ROUTE VERIFICATION
// ============================================================================

// [ ] Task 10: Verify /api/vehicles routes
//     Check:
//     - GET accepts ?companyId query param
//     - POST includes companyId in body
//     - PUT/DELETE use companyId in queries
//     
//     Files:
//     - /src/app/api/vehicles/route.ts
//     - /src/app/api/vehicles/[vehicleId]/route.ts

// [ ] Task 11: Verify /api/service-records routes
//     Check:
//     - Has auth session check
//     - Has RBAC permission check
//     - POST includes companyId in body
//     - Queries use companyId filter
//
//     File: /src/app/api/service-records/route.ts

// [ ] Task 12: Verify /api/work-orders routes
//     Already mostly done, but verify:
//     - GET with ?companyId filters correctly
//     - DELETE with ?companyId query param
//     - Complete route uses companyId throughout
//
//     Files:
//     - /src/app/api/work-orders/route.ts
//     - /src/app/api/work-orders/[id]/route.ts
//     - /src/app/api/work-orders/[id]/complete/route.ts

// ============================================================================
// PHASE 6: TESTING & VALIDATION
// ============================================================================

// [ ] Task 13: Test authentication flow
//     - Login → redirected to /setup-company (new user)
//     - Create company → redirected to /[companyId]/dashboard
//     - Access /dashboard without [companyId] → 404 or redirect

// [ ] Task 14: Test authorization flow
//     - User without company access → 403 on API calls
//     - User with company access → successful requests
//     - RBAC: 'user' role can't DELETE vehicles

// [ ] Task 15: Test company switching
//     - CompanySwitcher on home page works
//     - Switching companies updates URL
//     - Store updates activeCompanyId
//     - Pages show data for correct company

// [ ] Task 16: Test multi-company data isolation
//     - User A's vehicles don't appear for User B
//     - Work orders scoped to correct company
//     - Service records belong to correct company

// ============================================================================
// QUICK COMMANDS
// ============================================================================

/*
// Copy old route structure to new:
// cd src/app/protectedPages
// mkdir -p [companyId]/vehicles
// mkdir -p [companyId]/work-orders
// mkdir -p [companyId]/record-service
// cp vehicles/page.tsx [companyId]/vehicles/page.tsx
// cp work-orders/page.tsx [companyId]/work-orders/page.tsx
// cp record-service/page.tsx [companyId]/record-service/page.tsx

// Then update each page.tsx to:
// 1. Accept params: Promise<{ companyId: string }>
// 2. Extract companyId: const { companyId } = await params;
// 3. Pass to client components as prop
// 4. Update navigation links
*/

// ============================================================================
// ESTIMATED EFFORT
// ============================================================================

/*
Phase 1: COMPLETED ✅
- 4-5 hours of work already done

Phase 2: Route Migration
- 2-3 hours (moving and updating 3 route groups)

Phase 2B: Redirects
- 30 mins (if needed)

Phase 3: Client Components
- 1.5-2 hours (updating 4 components, testing each)

Phase 4: Store Initialization
- 30 mins (create wrapper)

Phase 5: API Verification
- 1-1.5 hours (verify + fix gaps)

Phase 6: Testing
- 1-2 hours (thorough testing)

TOTAL: ~11-14 hours remaining
*/
