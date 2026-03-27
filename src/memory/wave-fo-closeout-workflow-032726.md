# Wave FO Closeout Workflow & Rating Block Implementation
**Date:** March 27, 2026  
**Status:** Design Definition (No Code Implementation Yet)

---

## Complete Contractor-Client Workflow

### 1. Job Discovery & Expression of Interest
- **Client:** Posts job with `Job.title`, `description`, `location`, `budget_min/max`, `before_photo_urls`
- **Contractor:** Browses available jobs on Wave FO dashboard
- **Payment Gate:** Contractor pays $1.50 (or uses subscription) to unlock communication
- **Result:** Job enters "standby mode" with contractor interest expressed

### 2. Moving Out of Standby Mode (Profile Completeness Requirements)

**Required Contractor Fields to Progress:**
- `profile_complete: true`
- `identity_verified: true`
- `stripe_account_setup_complete: true` AND `stripe_account_charges_enabled: true`
- `compliance_acknowledged: true`
- `payment_compliant: true`
- `rating_block_active: false`
- If licensed: `license_verified: true`

**Blocker Logic:** System prevents scope submission/job progression until all fields met.

### 3. Scope of Work & Formal Agreement
- Contractor submits `ScopeOfWork` with summary, cost, timeline
- Client approves/rejects with optional notes
- If approved: Client signs (`customer_signature_url`, `customer_signed_scope_at`)

### 4. Work Execution
- Contractor performs work per agreement
- Optional: Track milestones via `ProjectMilestone` updates
- Optional: Collaboration via `ProjectMessage`

### 5. Closeout Process (REQUIRED FIELDS LIST)

**All of these must be completed before rating blocks are released:**

| Field | Entity | Type | Purpose |
|-------|--------|------|---------|
| `status` | ScopeOfWork | "closed" | Job marked complete |
| `customer_signature_url` | ScopeOfWork | URL | Scope signed by customer |
| `customer_signed_scope_at` | ScopeOfWork | Timestamp | When customer signed |
| `after_photo_urls` | ScopeOfWork | Array | After job photos (required by deadline) |
| `job_together_photo_url` | ScopeOfWork | URL | Contractor + customer together |
| `contractor_closeout_confirmed` | ScopeOfWork | Boolean | Contractor confirms completion |
| `customer_closeout_confirmed` | ScopeOfWork | Boolean | Customer confirms satisfaction |
| `platform_fee_amount` | ScopeOfWork | Number | Platform fee calculated & documented |
| `contractor_payout_amount` | ScopeOfWork | Number | Final payout calculated & documented |
| `contractor_satisfaction_rating` | ScopeOfWork | Enum | Contractor rates customer |
| `customer_satisfaction_rating` | ScopeOfWork | Enum | Customer rates contractor work |

### 6. Rating Block Enforcement (MANDATORY GATE)

**If ANY closeout field is missing:**
- Set `Contractor.rating_block_active: true`
- Populate `Contractor.pending_rating_scope_id` with scope ID
- Set `CustomerProfile.rating_block_active: true`
- Populate `CustomerProfile.pending_rating_scope_id` with scope ID

**Result:** 
- Contractor cannot accept new jobs
- Customer cannot post new jobs or contact new contractors

**Release Condition:**
- Both ratings submitted → blocks cleared
- Full `Review` entities created for both parties

---

## Implementation Status

### Design Phase ✅
- Workflow mapped end-to-end
- Required closeout fields defined
- Rating block logic specified

### To Build (Not Yet Implemented)
- [ ] Backend function: Enforce closeout field validation
- [ ] Backend function: Auto-set rating blocks on incomplete closeouts
- [ ] UI component: Rating block status widget (contractors)
- [ ] UI component: Rating block status widget (customers)
- [ ] UI blocking logic: Prevent new job acceptance if blocked
- [ ] UI blocking logic: Prevent new messaging if blocked

---

## Key Business Rules
1. **Standby → Active:** Contractor must have complete profile + all compliance checks
2. **Closeout → Complete:** All required fields must be populated (see table above)
3. **Rating → Mandatory:** Neither party can proceed without submitting their rating
4. **Block Persistence:** Remains until missing closeout field(s) completed