# Allowance App: Complete Implementation Guide

## Quick Start

### 1. Environment Setup
Ensure your `.env.local` contains:
```bash
AUTH0_SECRET=your-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/allowance-app
```

### 2. Database Initialization

Before running the app, ensure MongoDB indexes are created:

```bash
# Indexes are automatically created on model load
# If not, manually create in MongoDB:

db.children.createIndex({ familyId: 1, auth0UserId: 1 })
db.chores.createIndex({ familyId: 1, isActive: 1 })
db.dailyrecords.createIndex({ familyId: 1, childId: 1, date: -1 })
db.dailyrecords.createIndex({ childId: 1, isSubmitted: 1 })
db.dailyrecords.createIndex({ childId: 1, isApproved: 1 })
```

---

## Complete User Workflows

### Parent Workflow: Setting Up a Child & Chore

#### Step 1: Create Child Profile
**Endpoint**: `POST /api/children`

```bash
curl -X POST http://localhost:3000/api/children \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emma",
    "age": 10,
    "avatarUrl": "https://example.com/emma.jpg",
    "familyId": "507f1f77bcf86cd799439011"
  }'
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "familyId": "507f1f77bcf86cd799439011",
  "name": "Emma",
  "age": 10,
  "currentBalance": 0,
  "avatarUrl": "https://example.com/emma.jpg",
  "auth0UserId": null,
  "createdAt": "2026-01-26T10:00:00Z",
  "updatedAt": "2026-01-26T10:00:00Z"
}
```

#### Step 2: Create Chore Templates
**Endpoint**: `POST /api/chores`

```bash
# Create a one-time chore
curl -X POST http://localhost:3000/api/chores \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Clean bedroom",
    "rewardAmount": 5.00,
    "isRecurring": false,
    "familyId": "507f1f77bcf86cd799439011"
  }'

# Create a recurring chore (daily)
curl -X POST http://localhost:3000/api/chores \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Do homework",
    "rewardAmount": 3.00,
    "isRecurring": true,
    "intervalDays": 1,
    "suggestedTime": "3:00 PM",
    "familyId": "507f1f77bcf86cd799439011"
  }'
```

#### Step 3: Parent Views Child's Daily Record (Auto-Generated)
**Endpoint**: `POST /api/daily-records`

```bash
curl -X POST http://localhost:3000/api/daily-records \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "507f1f77bcf86cd799439012",
    "familyId": "507f1f77bcf86cd799439011"
  }'
```

**Response** (First time - generates today's record):
```json
{
  "_id": "607f1f77bcf86cd799439013",
  "familyId": "507f1f77bcf86cd799439011",
  "childId": "507f1f77bcf86cd799439012",
  "date": "2026-01-26T00:00:00Z",
  "choresList": [
    {
      "choreId": "507f1f77bcf86cd799439014",
      "taskName": "Do homework",
      "rewardAmount": 3.00,
      "completionStatus": 0,
      "isOverridden": false,
      "parentAdjustedReward": null,
      "notes": null
    }
  ],
  "isSubmitted": false,
  "isApproved": false,
  "penalties": [],
  "status": "pending",
  "submittedAt": null,
  "approvedAt": null,
  "totalReward": null
}
```

---

### Child Workflow: Daily Submission

#### Step 1: View Today's Record
The child sees the choresList with instructions and reward amounts

#### Step 2: Update Chore Completion Status
**Endpoint**: `PUT /api/daily-records/[id]`

```bash
# Mark homework as complete (1.0)
curl -X PUT http://localhost:3000/api/daily-records/607f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "updateChore",
    "choreIndex": 0,
    "completionStatus": 1
  }'

# Mark cleaning as partial (0.5)
curl -X PUT http://localhost:3000/api/daily-records/607f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "updateChore",
    "choreIndex": 1,
    "completionStatus": 0.5
  }'
```

#### Step 3: Submit Record
**Endpoint**: `PUT /api/daily-records/[id]`

```bash
curl -X PUT http://localhost:3000/api/daily-records/607f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "submit"
  }'
```

**Response**:
```json
{
  "_id": "607f1f77bcf86cd799439013",
  "isSubmitted": true,
  "submittedAt": "2026-01-26T18:30:00Z",
  "status": "submitted",
  "choresList": [
    {
      "choreId": "507f1f77bcf86cd799439014",
      "taskName": "Do homework",
      "completionStatus": 1,
      "rewardAmount": 3.00
    },
    {
      "choreId": "507f1f77bcf86cd799439015",
      "taskName": "Clean bedroom",
      "completionStatus": 0.5,
      "rewardAmount": 5.00
    }
  ]
}
```

---

### Parent Workflow: Review & Approval

#### Step 1: Parent Sees Submitted Record
**Endpoint**: `GET /api/daily-records/[id]`

Parent views child's claim:
- Homework: 100% complete → $3.00
- Bedroom: 50% complete → $2.50
- **Child's Total Claim**: $5.50

#### Step 2: Parent Reviews & Adjusts
**Endpoint**: `POST /api/daily-records/[id]/approve`

```bash
curl -X POST http://localhost:3000/api/daily-records/607f1f77bcf86cd799439013/approve \
  -H "Content-Type: application/json" \
  -d '{
    "choreAdjustments": [
      {
        "choreIndex": 1,
        "parentAdjustedReward": 4.00,
        "isOverridden": true
      }
    ],
    "penalties": [
      {
        "amount": 0.50,
        "reason": "Forgot to vacuum"
      }
    ]
  }'
```

**Calculation**:
```
Homework:      $3.00 (unchanged)
Bedroom:       $4.00 (parent override from $2.50)
Subtotal:      $7.00
Penalties:    -$0.50 (forgot vacuum)
Final Payout:  $6.50
```

**Response**:
```json
{
  "success": true,
  "record": {
    "_id": "607f1f77bcf86cd799439013",
    "isApproved": true,
    "approvedAt": "2026-01-26T19:00:00Z",
    "approvedBy": "auth0|user123",
    "status": "approved",
    "totalReward": 6.50,
    "choresList": [
      {
        "choreIndex": 0,
        "taskName": "Do homework",
        "completionStatus": 1,
        "rewardAmount": 3.00,
        "isOverridden": false
      },
      {
        "choreIndex": 1,
        "taskName": "Clean bedroom",
        "completionStatus": 0.5,
        "rewardAmount": 5.00,
        "parentAdjustedReward": 4.00,
        "isOverridden": true
      }
    ],
    "penalties": [
      {
        "amount": 0.50,
        "reason": "Forgot to vacuum",
        "appliedBy": "auth0|parent123",
        "appliedAt": "2026-01-26T19:00:00Z"
      }
    ]
  },
  "payout": {
    "totalChoreReward": 7.00,
    "totalPenalties": 0.50,
    "netPayout": 6.50,
    "childNewBalance": 106.50
  }
}
```

#### Step 3: Next Day - Rollover Logic
When child/parent creates tomorrow's record:

```
Previous Day:
  - Homework: ✓ Complete (1.0)
  - Bedroom: ◐ Partial (0.5)

Tomorrow's Record Will Include:
  - Bedroom (from rollover, since 0.5 ≠ 1.0)
  - Do homework (recurring, every day)
  - Any other recurring chores
```

---

## Component Integration

### Main Page Component
Location: `src/app/protectedPages/[companyId]/daily-records/page.tsx`

**Flow**:
```
1. Check if user is parent or child via /api/user-role
2. If parent: Show child selector
3. If child: Auto-redirect to own record
4. Load today's record (creates if needed)
5. Render appropriate component:
   - Child: DailyRecordView (editable)
   - Parent: ParentReview (if submitted) + DailyRecordView (read-only)
6. Show history below
```

### Component Props & State

**DailyRecordView**:
```typescript
interface DailyRecordViewProps {
  dailyRecord: IDailyRecord;
  child: IChild;
  isReadOnly: boolean;
  onChoreUpdate: (choreIndex: number, completionStatus: 0 | 0.5 | 1) => Promise<void>;
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
}
```

**ParentReview**:
```typescript
interface ParentReviewProps {
  dailyRecord: IDailyRecord;
  child: IChild;
  onApprove: (choreAdjustments: any[], penalties: any[]) => Promise<void>;
  isLoading?: boolean;
}
```

---

## Access Control Matrix

### API Route Protection

Every API route checks:
```typescript
const session = await getAuthSession();
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

const canAction = await hasPermission(session.userId, familyId, resource, action);
if (!canAction) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

### Frontend Guard

```typescript
const { session, isLoading } = useSession();
if (!session) {
  router.push('/api/auth/login');
  return null;
}
```

---

## Error Scenarios & Handling

### Scenario 1: Child Tries to Edit After Submission
```bash
curl -X PUT http://localhost:3000/api/daily-records/607f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -d '{"action": "updateChore", "choreIndex": 0, "completionStatus": 1}'
```

**Response** (400):
```json
{
  "error": "Cannot modify record after submission"
}
```

### Scenario 2: Child Tries to Approve Record
```bash
curl -X POST http://localhost:3000/api/daily-records/607f1f77bcf86cd799439013/approve \
  -H "Content-Type: application/json" \
  -d '{"choreAdjustments": [], "penalties": []}'
```

**Response** (403):
```json
{
  "error": "Forbidden"
}
```

### Scenario 3: Child Tries to Access Sibling's Record
```bash
# Child A (auth0|child-a) tries to modify Child B's record
curl -X PUT http://localhost:3000/api/daily-records/sibling-record-id \
  -H "Content-Type: application/json" \
  -d '{"action": "submit"}'
```

**Response** (403):
```json
{
  "error": "Forbidden"
}
```

**Why**: System verifies `childId` in record matches authorized child

---

## Testing Checklist

### Unit Tests
- [ ] Rollover logic: Incomplete chores carry forward
- [ ] Recurrence logic: Daily chores auto-added
- [ ] Payout calculation: Multiple scenarios
- [ ] Sanitization: Invalid inputs rejected

### Integration Tests
- [ ] Complete lifecycle: Create → Submit → Approve
- [ ] Parent override: Chore reward modification
- [ ] Penalties: Multiple penalties sum correctly
- [ ] Balance update: Child currentBalance incremented

### Access Control Tests
- [ ] Parent: Can view all children
- [ ] Child: Can only view own record
- [ ] Child: Cannot approve
- [ ] Child: Cannot access sibling record
- [ ] Cross-family isolation: Can't access other family's records

### UI Tests
- [ ] Child submission flow: Status toggles work
- [ ] Parent review flow: Overrides and penalties calculate
- [ ] Auto-redirection: Child redirected to own record
- [ ] History display: Past records shown correctly

---

## Performance Considerations

### Database Queries
- Use compound indexes for fast lookups
- Aggregate penalties in application layer
- Cache daily records in browser session

### API Optimization
- Batch child/chore fetches when possible
- Paginate history (default: 30 days)
- Return normalized data (IDs as strings)

### Frontend
- Lazy load history component
- Debounce completion status updates
- Cache user role checks for session duration

---

## Debugging

### View Daily Record Details
```javascript
// In browser console
fetch('/api/daily-records?childId=X&familyId=Y')
  .then(r => r.json())
  .then(console.log)
```

### Check User Role
```javascript
fetch('/api/user-role?familyId=FAMILY_ID')
  .then(r => r.json())
  .then(console.log)
```

### View Child Record
```javascript
fetch('/api/children/CHILD_ID')
  .then(r => r.json())
  .then(console.log)
```

### Check API Logs
```bash
# In server terminal, look for:
- "GET /api/daily-records error:"
- "PUT /api/daily-records/[id] error:"
- "POST /api/daily-records/[id]/approve error:"
```

---

## Next Steps

1. **Auth0 Configuration**: Add custom claim for role (parent/child)
2. **UI Polish**: Add animations, transitions
3. **Notifications**: Email parents of pending submissions
4. **Mobile**: Responsive design for phones/tablets
5. **Reporting**: Monthly earning summaries
6. **Rules**: Custom penalty rules engine

---

## File Reference

| File | Purpose |
|------|---------|
| [Child.ts](src/models/Child.ts) | MongoDB child schema |
| [Chore.ts](src/models/Chore.ts) | MongoDB chore template schema |
| [DailyRecord.ts](src/models/DailyRecord.ts) | MongoDB daily record schema |
| [dailyRecords.ts](src/lib/dailyRecords.ts) | Core business logic (rollover, payout) |
| [childAccess.ts](src/lib/access-control/childAccess.ts) | Access control helpers |
| [permissions.ts](src/lib/access-control/permissions.ts) | RBAC permission matrix |
| [DailyRecordView.tsx](src/components/DailyRecord/DailyRecordView.tsx) | Child/Parent view component |
| [ParentReview.tsx](src/components/DailyRecord/ParentReview.tsx) | Parent approval component |
| [daily-records/page.tsx](src/app/protectedPages/[companyId]/daily-records/page.tsx) | Main page |

---

**Implementation Date**: January 26, 2026
**Status**: ✅ Complete
**Next Review**: Q2 2026
