# Contractor Facilitation Fee Tier System

## Overview
SurfCoast uses a **3-tier sliding scale** facilitation fee system to reward contractor growth while keeping costs low for new professionals. The lower you earn, the lower your fee—creating an incentive structure aligned with contractor success.

## Tier Structure

| Tier | Annual Earnings | Fee % | Target |
|------|-----------------|-------|--------|
| **Bronze** | $0 - $15,000 | 2% | New contractors, low friction entry |
| **Silver** | $15,000 - $50,000 | 10% | Growing professionals |
| **Gold** | $50,000+ | 15% | Established experts |

## How It Works

### 1. Automatic Tier Assignment
- Contractors start at **Bronze** tier
- Tier updates automatically based on annual earnings
- Resets each calendar year
- Lifetime earnings tracked separately

### 2. Fee Calculation
When a contractor completes a job and receives a payout:

1. Earnings amount added to annual total
2. Tier recalculated automatically
3. Tier change triggers (if applicable)
4. Facilitation fee percentage updated in contractor profile

### 3. Transparency & Motivation
Each contractor sees:
- Current tier and applicable fee
- Annual earnings YTD
- Progress to next tier (% complete)
- Dollar amount needed to tier up
- Tier change notifications

## Integration

### In Job Closeout Flow
After customer approves scope and payment is processed:

```javascript
// Calculate final payout and update tier
const payoutAmount = calculatePayout(scope); // in cents
await base44.functions.invoke('calculateContractorTier', {
  contractorId: contractor.id,
  contractorEmail: contractor.email,
  payoutAmount: payoutAmount
});
```

### Initialize on First Job
When contractor completes first job:

```javascript
await base44.functions.invoke('initializeContractorTier', {
  contractorId: contractor.id,
  contractorEmail: contractor.email
});
```

### Display in Dashboard
```jsx
import ContractorTierDashboard from '@/components/contractor/ContractorTierDashboard';

<ContractorTierDashboard 
  contractorId={contractor.id}
  contractorEmail={contractor.email}
/>
```

## Backend Functions

### `calculateContractorTier.js`
Calculates and updates contractor tier based on payout amount.

**Input:**
```json
{
  "contractorId": "string",
  "contractorEmail": "string",
  "payoutAmount": 5000 (cents)
}
```

**Output:**
```json
{
  "success": true,
  "tier": "bronze|silver|gold",
  "fee": 2|10|15,
  "annualEarnings": 150000,
  "earnedToNextTier": 1350000
}
```

**Logic:**
- Adds payout to annual earnings total
- Recalculates tier based on threshold
- Tracks tier changes with timestamp
- Updates facilitation fee percentage
- Calculates remaining earnings to next tier

### `initializeContractorTier.js`
Creates initial tier record for new contractors.

**Input:**
```json
{
  "contractorId": "string",
  "contractorEmail": "string"
}
```

**Output:**
```json
{
  "success": true,
  "tier": {
    "current_tier": "bronze",
    "current_facilitation_fee": 2,
    "annual_earnings": 0,
    "earnings_to_next_tier": 1500000
  }
}
```

## Stripe Integration

### Setting Facilitation Fee
When creating a payout to a contractor, use their current tier's fee:

```javascript
// Get contractor's current tier
const tierRecord = await base44.entities.ContractorTier.filter({
  contractor_id: contractorId
});

const fee = tierRecord[0].current_facilitation_fee; // 2, 10, or 15
const facilitationAmount = (payoutAmount * fee) / 100;
const contractorPayout = payoutAmount - facilitationAmount;

// Use contractorPayout for Stripe transfer
```

## Entity: ContractorTier

```json
{
  "contractor_id": "string (unique per contractor)",
  "contractor_email": "string",
  "current_tier": "bronze|silver|gold",
  "previous_tier": "bronze|silver|gold (optional)",
  "annual_earnings": "number (cents)",
  "lifetime_earnings": "number (cents)",
  "current_facilitation_fee": "2|10|15",
  "tier_changed_at": "ISO timestamp (when tier changed)",
  "next_tier_earnings_needed": "number (cents)",
  "earnings_to_next_tier": "number (cents)",
  "year": "number (calendar year)"
}
```

## User Experience Flow

### For New Contractor
1. Completes profile → starts at Bronze tier
2. Completes first job → tier record initialized
3. Views dashboard → sees "2% fee" and progress tracking
4. Earns more → progress bar fills toward Silver

### For Growing Contractor
1. Reaches $15K threshold → automatically promoted to Silver
2. Dashboard shows: "You've been promoted to Silver!"
3. Future jobs billed at 10% instead of 2%
4. Sees progress to Gold ($50K mark)

### For Established Contractor
1. Reaches $50K threshold → promoted to Gold
2. Tier locked at Gold (no higher tier)
3. Enjoys 15% fee (vs industry standard 20%+)
4. Lifetime earnings displayed for prestige

## Transparency & Communication

### Dashboard Display
- Current tier badge (Bronze/Silver/Gold)
- Annual earnings YTD
- Lifetime earnings total
- Progress bar to next tier
- Dollar amount needed to tier up
- Tier change history

### Email Notifications (Optional)
When contractor tiers up:
- Congratulations email
- New fee rate information
- Encouragement for next milestone

## Important Notes

1. **Annual Reset**: Earnings reset each calendar year, but lifetime earnings persist
2. **Billing Cycle**: Fee applies based on contractor's current tier at time of payout
3. **Year Tracking**: Each contractor has one tier record per year
4. **Backdated Changes**: If tier changes, it applies to future payouts, not past ones
5. **Fairness**: Even Gold tier (15%) is competitive against industry standards (18-20%)

## Testing Checklist

- [ ] New contractor assigned Bronze tier on signup
- [ ] Tier record created on first job completion
- [ ] Earnings accumulate correctly after each payout
- [ ] Tier promotion triggers at $15K threshold
- [ ] Tier promotion triggers at $50K threshold
- [ ] Fee percentage updates in contractor profile
- [ ] Progress bar calculates correctly
- [ ] Dashboard displays tier information
- [ ] Tier changes show timestamp
- [ ] Lifetime earnings persist across years
- [ ] Multiple year records don't conflict
- [ ] Tier promotion notifications work

## Future Enhancements

- Tier-based badges on contractor profiles
- Leaderboards by tier
- Tier-specific features or perks
- Bulk tier recalculation script (audit/maintenance)
- Tier projection calculator ("You'll be Silver in X months")
- Historical tier tracking for analytics