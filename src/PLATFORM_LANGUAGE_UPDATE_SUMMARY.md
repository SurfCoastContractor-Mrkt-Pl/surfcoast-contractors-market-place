# Platform Language Update Summary
## March 27, 2026

### Overview
Comprehensive platform-wide audit and update to all fine print, dashboards, and messaging to reflect the new tier system, pricing structure, and fee language.

---

## Files Updated

### 1. **Dashboard Pages**
#### ContractorAccount (pages/ContractorAccount.jsx)
- ✅ Updated "Platform Fee Status" to "Platform Facilitation Fees"
- ✅ Added tier structure explanation (Bronze 2%, Silver 10%, Gold 15%)
- ✅ Updated Fees tab description to reflect sliding-scale system

#### ResidentialWaveDashboard (pages/ResidentialWaveDashboard.jsx)
- ✅ Updated header from "Residential Wave" to "Residential Wave (Legacy)"
- ✅ Added note that dashboard is superseded by new Wave FO plans
- ✅ Updated trial banner with new tier information
- ✅ Updated pricing display for new Wave FO tiers ($19-$125/month)

#### Dashboard (pages/Dashboard.jsx)
- ✅ Verified admin sections intact
- ✅ No fee language needed updates

#### CustomerAccount (pages/CustomerAccount.jsx)
- ✅ Verified no fee-specific language needed updates

#### BecomeContractor (pages/BecomeContractor.jsx)
- ✅ Changed hero section from "18% facilitation fee only" to "Sliding-scale facilitation fees (2-15%)"

#### Home (pages/Home.jsx)
- ✅ Updated hero copy for contractors from "Get paid securely via Stripe" to "Earn with sliding-scale fees (2-15%)"

### 2. **Contractor Components**
#### PayoutManagementDashboard (components/contractor/PayoutManagementDashboard.jsx)
- ✅ Completely rewrote Fees tab with tier structure
- ✅ Added Bronze, Silver, Gold tier descriptions
- ✅ Updated copy from "higher earnings and positive reviews" to "move up tiers and save on facilitation fees"

#### EarningsReportsDashboard (components/contractor/EarningsReportsDashboard.jsx)
- ✅ Updated "Platform Fees Paid" metric to "Facilitation Fees Paid"
- ✅ Added note about sliding-tier system in metric

#### OnboardingStep5Policies (components/contractor/OnboardingStep5Policies.jsx)
- ✅ Completely updated fee disclosure section
- ✅ Changed from static "18%" to sliding scale (2%, 10%, 15%)
- ✅ Added example payout for Bronze tier ($1,000 job = $980 payout)
- ✅ Added note about annual tier updates

### 3. **Communication/Messaging Components**
#### MessagingPricingTable (components/messaging/MessagingPricingTable.jsx)
- ✅ Added fine print about pricing models
- ✅ Added note: "Monthly subscription ($50) grants unlimited messaging. One-time options ($1.50-$1.75) for single-use."

#### TimedChatInitiator (components/timed-chat/TimedChatInitiator.jsx)
- ✅ Verified pricing ($1.50 for 10 minutes) is correct
- ✅ Fine print confirmed

#### QuoteRequestPaymentGate (components/quote/QuoteRequestPaymentGate.jsx)
- ✅ Updated copy from "unlock contractor contact info" to "contractor receives your details and can respond with a quote"
- ✅ Added fine print: "One-time fee. No ongoing commitment required."

### 4. **Market Shop Components**
#### MarketShopSubscription (components/marketshop/MarketShopSubscription.jsx)
- ✅ Updated Facilitation Fee model from "0% transaction fee, keep 100%" to "5% per sale"
- ✅ Updated payment model selector title to include pricing
- ✅ Verified $35/month subscription copy

### 5. **Legal Documents**
#### Terms (pages/Terms.jsx)
- ✅ Complete new pricing and fee structure section (Section 10)
- ✅ Contractor tier system (Bronze 2%, Silver 10%, Gold 15%)
- ✅ MarketShop vendor pricing ($35/month or 5%)
- ✅ Communication pricing ($1.50, $1.75, $50/month)
- ✅ Wave FO Plans with all tiers and pricing
- ✅ Facilitation fee calculations and examples

---

## Key Language Changes

### Old Language → New Language
- "18% platform fee" → "Sliding-scale facilitation fee (2-15%)"
- "Platform Fee Status" → "Platform Facilitation Fees"
- "Higher earnings qualify for lower fees" → "Build your earnings to move up tiers and save on facilitation fees"
- "Residential Wave" → "Residential Wave (Legacy)" (with note about Wave FO)
- "Unlock contractor contact info" → "Contractor receives your details and can respond with a quote"

---

## Components Not Requiring Updates

- CustomerSignup (pages/CustomerSignup.jsx) - No fee-specific messaging
- All payment/stripe components - Handled through checkout
- Authentication pages - No fee messaging needed
- Home page footer - Already updated
- Basic profile pages - No fee references

---

## Verification Checklist

- [x] All contractor dashboards updated with tier system
- [x] All messaging components show correct pricing
- [x] Market shop subscription shows correct models
- [x] Home page hero copy updated
- [x] BecomeContractor onboarding shows new fee structure
- [x] Terms & Conditions completely rewritten
- [x] Payout management dashboard updated
- [x] Earnings reports updated
- [x] Market shop components updated
- [x] No contradictory fee information remains

---

## Files Requiring Minor/No Updates

These files either don't mention fees or are legacy/not critical to platform messaging:
- CustomerAccount.jsx - Client-focused, no fee language
- Dashboard.jsx - Admin dashboard, verified no updates needed
- Various modal/form components - No fee language needed
- Layout components - No fee messaging
- Utility files - No fee language

---

## Summary

**Total Updates Made:** 11 major files
**Total Minor Updates:** 6 supporting files
**Status:** Complete platform language update for tier system and pricing structure

All customer-facing messaging, dashboards, and fine print now reflects:
1. Sliding-scale facilitation fees (2-15% for contractors)
2. Wave FO subscription tiers ($19-$125/month)
3. MarketShop pricing ($35/month or 5%)
4. Communication pricing ($1.50-$50/month)
5. Accurate payout calculations

Platform is now consistent in fee messaging across all touchpoints.