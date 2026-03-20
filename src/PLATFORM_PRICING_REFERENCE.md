# SurfCoast Platform Pricing Reference

Last Updated: March 20, 2026

## Overview
SurfCoast Marketplace uses transparent, fair pricing designed to reward growth and remove barriers to entry.

---

## Contractor Pricing (Sliding Scale Facilitation Fees)

### Tier Structure
Contractors are automatically placed in tiers based on cumulative annual earnings.

| Tier | Annual Earnings | Fee % | Example Payout |
|------|-----------------|-------|----------------|
| **Bronze** | $0 - $15,000 | 2% | $1,000 job → $980 to contractor |
| **Silver** | $15,000 - $50,000 | 10% | $1,000 job → $900 to contractor |
| **Gold** | $50,000+ | 15% | $1,000 job → $850 to contractor |

### Key Points
- **Tier Assignment**: Automatic based on cumulative earnings each year
- **Tier Reset**: Annual (January 1st)
- **Lifetime Earnings**: Tracked separately and never reset
- **Tier Changes**: Apply to future payouts, not retroactively
- **Advancement**: Automatic—no manual claim or action needed

### Database Integration
- Entity: `ContractorTier`
- Auto-calculated by: `calculateContractorTier.js` function
- Initialized by: `initializeContractorTier.js` function
- Display: `ContractorTierDashboard.jsx` component

---

## Market Vendor Pricing

### Payment Model Options
Vendors choose between two models and can switch at the start of their next billing cycle.

#### Option 1: Subscription Model
- **Cost**: $35/month
- **Benefits**: 
  - Unlimited shop listings
  - 0% transaction fee (keep 100% of sales)
  - Predictable monthly cost
  - Best for: High-volume vendors, farmers markets, regular events

#### Option 2: Facilitation Fee Model
- **Cost**: 5% per transaction
- **Benefits**:
  - No monthly subscription
  - Pay only on sales
  - Flexible for seasonal vendors
  - Best for: New vendors, low-volume operations

### Database Integration
- Entity: `Subscription` (for vendors)
- Payment Model: `payment_model` field (subscription/facilitation)
- Pending Switch: `pending_model_switch` field

---

## Customer Communication Pricing

### One-Time Messaging
- **Limited Communication**: $1.50
  - Single message thread
  - Good for quick questions
  - No ongoing access

- **Quote Request**: $1.75
  - For specific project quotes
  - No ongoing communication

### Subscription Messaging
- **Unlimited Messaging**: $50/month
  - Unlimited messages
  - Multiple conversations
  - Best for: Ongoing collaborations

---

## Platform Economics

### Contractor Payout Example (Annual View)
```
Contractor A earns $20,000 this year:
- Year starts in Bronze (0-15K): earns $10K at 2% fee → keeps $9,800
- Moves to Silver (15K-50K): earns $10K at 10% fee → keeps $9,000
- Total payout: $18,800
- Total platform fees: $1,200
```

### Vendor Payout Example (Annual View)
```
Vendor A - Subscription Model:
- Annual revenue: $10,000
- Monthly subscription: $35 × 12 = $420
- Net to vendor: $10,000 - $420 = $9,580

Vendor B - Facilitation Model (same revenue):
- Annual revenue: $10,000
- 5% facilitation fee: $500
- Net to vendor: $10,000 - $500 = $9,500
```

---

## Terms & Conditions References

### Terms of Service (pages/Terms.jsx)
- **Section 10**: Full fee structure and calculations
- Updated to include tier system for contractors
- Includes both vendor payment models
- Communication fees listed

### Privacy Policy (pages/PrivacyPolicy.jsx)
- No pricing changes (structural policy only)
- Data collection practices remain unchanged

### Contractor Signup (pages/ContractorSignup.jsx)
- Hero text: "Low fees starting at just 2%. We reward growth with a sliding scale."
- Emphasizes entry barrier removal

---

## Component & Page References

### New Pages
- **`pages/PricingGuide.jsx`**: Full pricing page for all users
  - Route: `/Pricing`
  - Includes all three user types (contractors, vendors, customers)
  - Visual tier comparisons
  - Why our pricing section

### New Components
- **`components/pricing/PricingDisclosure.jsx`**: Reusable fee disclosure alerts
  - Props: `userType` (contractor/vendor/customer)
  - Used in dashboards, onboarding, checkout flows

### Existing Components (Updated)
- **`ContractorTierDashboard.jsx`**: Shows current tier and progress
- **`SubscriptionManager.jsx`**: Vendor model switching
- **`PaymentMethodManager.jsx`**: Vendor payment updates

---

## Internal Logic & Functions

### Contractor Tier Calculation
**Function**: `calculateContractorTier.js`

```javascript
// Input
{
  contractorId: "string",
  contractorEmail: "string",
  payoutAmount: 5000 (cents)
}

// Output
{
  success: true,
  tier: "bronze|silver|gold",
  fee: 2|10|15,
  annualEarnings: 150000,
  earnedToNextTier: 1350000
}
```

**Logic**:
1. Add payout to annual earnings
2. Recalculate tier based on thresholds
3. Update tier record if changed
4. Calculate remaining earnings to next tier
5. Update contractor profile with new fee %

### Tier Initialization
**Function**: `initializeContractorTier.js`

Called when contractor completes first job. Creates initial `ContractorTier` record with:
- `current_tier: "bronze"`
- `current_facilitation_fee: 2`
- `annual_earnings: 0`
- `year: current_year`

---

## Legal & Compliance

### All Changes Include
✓ Terms of Service updates (Section 10)
✓ Contractor signup messaging
✓ Pricing disclosure components
✓ Database schema updates
✓ Backend calculation functions
✓ Dashboard UI components
✓ Public pricing page

### Customer Communication
- Pricing displayed at point of sale
- Clear fee disclosures before checkout
- Dashboard shows applied fees
- Invoice/receipt includes fee breakdown

---

## Implementation Checklist

- [x] Create `ContractorTier` entity
- [x] Create `calculateContractorTier.js` function
- [x] Create `initializeContractorTier.js` function
- [x] Create `ContractorTierDashboard.jsx` component
- [x] Update `Terms.jsx` with tier details
- [x] Update `ContractorSignup.jsx` messaging
- [x] Create `PricingGuide.jsx` page
- [x] Create `PricingDisclosure.jsx` component
- [x] Update `App.jsx` routing
- [x] Create this reference document
- [ ] Update marketing materials (website copy, email templates)
- [ ] Create email notification for tier promotions
- [ ] Add tier tier badges to contractor profiles
- [ ] Build admin tier audit tools (if needed)

---

## FAQ

### Q: What happens if a contractor drops below a tier threshold?
A: Tiers don't drop within a calendar year. Once a contractor reaches Silver or Gold, they stay there for the rest of the year. New year, starts fresh.

### Q: Can a vendor switch models mid-month?
A: No. Model switches take effect at the start of the next billing cycle to avoid proration confusion.

### Q: Are there discounts for high-volume transactions?
A: No. The tier system IS the discount for contractors. Gold tier (15%) is already very competitive.

### Q: How is lifetime earnings used?
A: Currently tracked for transparency. Future use: loyalty badges, prestige indicators, or historical reporting.

### Q: Can contractors see their tier progress?
A: Yes. `ContractorTierDashboard` shows current tier, earnings YTD, and progress to next tier.

### Q: What if a contractor disagrees with their tier?
A: Tier is purely mathematical. They can request an audit, but if the math is correct, the tier stands.

---

## Future Enhancements

- [ ] Tier-based badges on public contractor profiles
- [ ] Leaderboards by tier
- [ ] Tier-specific features or perks
- [ ] Historical tier tracking for analytics
- [ ] Bulk tier recalculation script (audit/maintenance)
- [ ] Projected tier calculator ("Earn $X more to reach next tier")
- [ ] Email notifications for tier promotions