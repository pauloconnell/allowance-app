# Allowance App: Daily Record System Documentation

## Overview

This document describes the complete implementation of the **Daily Record System** for the Allowance App, a multi-tenant family management application pivoted from the original Fleet Management system.

## Entity & Data Mapping

### Vehicle → Child
- **Fields**: `name`, `age`, `currentBalance`, `avatarUrl`, `auth0UserId` (optional)
- **Model**: [Child.ts](src/models/Child.ts)
- **Type**: [IChild.ts](src/types/IChild.ts)

### WorkOrder → Chore
- **Fields**: `taskName`, `rewardAmount`, `isRecurring`, `intervalDays`, `suggestedTime`, `dueDate`, `isActive`
- **Model**: [Chore.ts](src/models/Chore.ts)
- **Type**: [IChore.ts](src/types/IChore.ts)

### ServiceRecord → DailyRecord
- **Fields**: `date`, `childId`, `familyId`, `choresList`, `isSubmitted`, `isApproved`, `penalties`, `status`, `totalReward`
- **Model**: [DailyRecord.ts](src/models/DailyRecord.ts)
- **Type**: [IDailyRecord.ts](src/types/IDailyRecord.ts)

## DailyRecord Lifecycle

### 1. Initialization (Rollover Logic)

**Trigger**: Page load or API call to `POST /api/daily-records`

**Process**:
```
IF today's DailyRecord does NOT exist:
  1. Identify all chores from yesterday where completionStatus === 0
  2. Carry these into today's choresList (ROLLOVER)
  3. Check master Chore templates where isRecurring === true
  4. Add recurring chores NOT already in rollover list (RECURRENCE)
  5. Create new DailyRecord for today with combined choresList
```

**Implementation**: [getOrCreateTodaysDailyRecord()](src/lib/dailyRecords.ts)

### 2. Child Submission & Interaction

**Child Actions**:
1. View today's DailyRecord
2. Toggle chore completion status: `0` (Not Done) → `0.5` (Partial) → `1` (Complete)
3. Update status via `PUT /api/daily-records/[id]` with `{ action: 'updateChore', choreIndex, completionStatus }`
4. Submit record when ready via `PUT /api/daily-records/[id]` with `{ action: 'submit' }`

**UI State**:
- **Before submission**: Record is editable, child can modify completion status
- **After submission**: UI becomes read-only, awaiting parent approval

**Implementation**: [DailyRecordView.tsx](src/components/DailyRecord/DailyRecordView.tsx)

### 3. Parent Review & Override

**Parent Actions**:
1. View child's submitted record
2. Override individual chore rewards (e.g., reduce $10 to $7 for incomplete work)
3. Add penalties with reason (e.g., "Tardy submission: -$2")
4. Approve and process payout

**Override Logic**:
- Parent can set `parentAdjustedReward` for any chore
- If overridden, this value replaces the calculated reward
- Formula: `reward = isOverridden ? parentAdjustedReward : (rewardAmount * completionStatus)`

**Implementation**: [ParentReview.tsx](src/components/DailyRecord/ParentReview.tsx)

### 4. Final Payout Calculation & Balance Update

**Formula**:
```
totalChoreReward = SUM(chore.rewardAmount * completionStatus)
totalAdjustedReward = SUM(parentAdjustedReward) OR totalChoreReward if no overrides
totalPenalties = SUM(penalty.amount)
netPayout = MAX(0, totalAdjustedReward - totalPenalties)
child.currentBalance += netPayout  // Atomic MongoDB update
```

**Implementation**: [approveDailyRecord()](src/lib/dailyRecords.ts)

**API Endpoint**: `POST /api/daily-records/[id]/approve`
```json
{
  "choreAdjustments": [
    { "choreIndex": 0, "parentAdjustedReward": 7.50, "isOverridden": true }
  ],
  "penalties": [
    { "amount": 2.00, "reason": "Late submission" }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "record": { /* updated DailyRecord */ },
  "payout": {
    "totalChoreReward": 25.00,
    "totalPenalties": 2.00,
    "netPayout": 23.00,
    "childNewBalance": 48.75
  }
}
```

## Access Control

### Role-Based Access Control (RBAC)

**User Roles**:
- **Parent**: Can manage family, view/edit all children's records, approve records
- **Child**: Can only view/edit own record, cannot approve or add penalties
- **Admin**: Full access

**Permission Matrix**:

| Resource | Action | Parent | Child | Admin |
|----------|--------|--------|-------|-------|
| daily-record | read | ✓ | ✓ (own) | ✓ |
| daily-record | write | ✓ | ✓ (own) | ✓ |
| daily-record | approve | ✓ | ✗ | ✓ |
| child | read | ✓ | ✓ (own) | ✓ |
| child | write | ✓ | ✗ | ✓ |
| child | create | ✓ | ✗ | ✓ |
| chore | read | ✓ | ✓ | ✓ |
| chore | write | ✓ | ✗ | ✓ |
| chore | create | ✓ | ✗ | ✓ |

**Implementation**: [permissions.ts](src/lib/access-control/permissions.ts)

### Child Auto-Redirection

**Logic**:
1. Child logs in and navigates to `/protected/[companyId]/daily-records`
2. System checks `GET /api/user-role?familyId=[companyId]`
3. If child, redirects to their own daily record automatically
4. Prevents cross-sibling record access via Auth0 roles and database checks

**Implementation**: [childAccess.ts](src/lib/access-control/childAccess.ts), [daily-records/page.tsx](src/app/protectedPages/[companyId]/daily-records/page.tsx)

### Enforcement Points

All API routes check permissions:
```typescript
const canRead = await hasPermission(session.userId, familyId, 'daily-record', 'read');
if (!canRead) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## API Routes

### Daily Records
- `GET /api/daily-records` - List records for a child (30-day default)
- `POST /api/daily-records` - Create/retrieve today's record
- `GET /api/daily-records/[id]` - Get specific record
- `PUT /api/daily-records/[id]` - Update chore or submit
- `POST /api/daily-records/[id]/approve` - Parent approval with adjustments

### Children
- `GET /api/children` - List all children in family
- `POST /api/children` - Create new child
- `GET /api/children/[childId]` - Get child details
- `PUT /api/children/[childId]` - Update child info
- `DELETE /api/children/[childId]` - Remove child

### Chores
- `GET /api/chores` - List chores for family
- `POST /api/chores` - Create chore template
- `GET /api/chores/[choreId]` - Get chore details
- `PUT /api/chores/[choreId]` - Update chore
- `DELETE /api/chores/[choreId]` - Soft delete chore

### User Role Helpers
- `GET /api/user-role?familyId=X` - Check if parent or child
- `GET /api/get-child-id?familyId=X` - Get child ID for current user

## Component Structure

### DailyRecordView
- Child view: Editable until submission
- Shows completion status for each chore
- Displays running total earnings
- Submit button (becomes disabled after submission)

### ParentReview
- Parent view for submitted records
- Override individual chore rewards
- Add/remove penalties with reasons
- Final payout calculation preview
- Approve & process payout button

### DailyRecordHistory
- Tabular view of past records
- Status badges (pending, submitted, approved)
- Quick stats: chores completed, earned, final

## Database Indexes

**DailyRecord**:
- `{ familyId: 1, childId: 1, date: -1 }` - Primary query pattern
- `{ childId: 1, isSubmitted: 1 }` - For finding pending submissions
- `{ childId: 1, isApproved: 1 }` - For approved records

**Child**:
- `{ familyId: 1, auth0UserId: 1 }` - User to child mapping

These indexes ensure fast queries for:
- Getting today's record for a child
- Finding all pending/approved records
- Looking up a child by Auth0 user ID

## Error Handling

**Validation Errors**:
- Missing childId/familyId: 400 Bad Request
- Cannot update after submission: 400 Bad Request
- Invalid chore index: 400 Bad Request

**Authorization Errors**:
- Not authenticated: 401 Unauthorized
- Insufficient permissions: 403 Forbidden

**Not Found**:
- Record/child/chore not found: 404 Not Found

**Server Errors**:
- Database operations: 500 Internal Server Error
- All errors logged to console for debugging

## Testing Strategy

### Unit Tests
- [normalizeRecord.test.ts](src/tests/lib/normalizeRecord.test.ts)
- Rollover logic: `getRolloverChores()`, `getRecurringChores()`
- Payout calculation: Various balance scenarios

### Integration Tests
- Full DailyRecord lifecycle: Create → Submit → Approve
- Access control: Parent vs. Child access
- Error scenarios: Missing fields, unauthorized access

### E2E Tests
- Complete user journeys
- Parent workflow: View children → Approve records
- Child workflow: View record → Submit

## Future Enhancements

1. **Chore Assignment**: Link specific chores to specific children
2. **Recurring Patterns**: Auto-rollover by day of week (vs. all incomplete)
3. **Notifications**: Alert parents of pending submissions
4. **Reporting**: Monthly/yearly earning summaries
5. **Rules Engine**: Custom penalty rules (e.g., "-10% for late submission")
6. **Mobile App**: React Native version with offline support

## Migration Notes

### From Vehicle/WorkOrder/ServiceRecord
- **Do NOT delete** original models; they remain for fleet management
- New Daily Record system is parallel implementation
- Can coexist in same multi-tenant family
- Future versions can deprecate old system

### Data Transformation (if needed)
```typescript
// Vehicle → Child
new Child({
  familyId: vehicle.companyId,
  name: vehicle.nickName,
  age: 0, // Manual entry required
  currentBalance: 0,
  avatarUrl: null
})

// WorkOrder → Chore
new Chore({
  familyId: workOrder.companyId,
  taskName: workOrder.serviceType,
  rewardAmount: 0, // Manual entry required
  isRecurring: workOrder.isRecurring,
  intervalDays: workOrder.serviceFrequencyWeeks ? workOrder.serviceFrequencyWeeks * 7 : null
})
```

## References

- **Auth0 Integration**: [auth.ts](src/lib/auth.ts)
- **RBAC**: [rbac.ts](src/lib/rbac.ts)
- **Sanitization**: [sanitizeCreate.ts](src/lib/sanitizeCreate.ts), [sanitizeInput.ts](src/lib/sanitizeInput.ts)
- **Normalization**: [normalizeRecord.ts](src/lib/normalizeRecord.ts)
