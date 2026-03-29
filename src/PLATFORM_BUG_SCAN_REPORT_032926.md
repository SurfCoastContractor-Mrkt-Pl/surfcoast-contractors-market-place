# Platform Bug Scan Report
**Date:** March 29, 2026  
**Scope:** Full platform (frontend + backend)  
**Status:** 7 issues found - 2 CRITICAL, 3 HIGH, 2 MEDIUM

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Issue #1: MarketShopSubscription Uses Legacy `subscription_status` Field
**Location:** `components/marketshop/MarketShopSubscription.jsx`  
**Lines:** 10, 124, 151, 261  
**Severity:** CRITICAL  
**Problem:**
- Component uses deprecated `subscription_status` field throughout
- New field is `wave_shop_subscription_status` (set by webhook)
- Causes feature gating logic to fail (payment model selector always shows even when subscribed)
- Also appears in `MarketShopDashboard.jsx` line 221

**Impact:**
- Reviews tab may not show even with active subscription
- Payment model selector appears even when vendor is already subscribed
- State machine logic broken

**Code Evidence:**
```javascript
// Line 10 - WRONG
const [showModelSelector, setShowModelSelector] = useState(shop.subscription_status !== 'active');

// Line 124 - WRONG
{shop.subscription_status !== 'active' && shop.subscription_status !== 'past_due' && (

// Line 151 - WRONG
{showModelSelector && shop.subscription_status !== 'active' && (

// Line 261 - WRONG
{shop.subscription_status === 'active' && (
```

**Fix Required:**
Replace all instances of `shop.subscription_status` with `shop.wave_shop_subscription_status`

---

### Issue #2: `createVendorConnectAccount` Returns Wrong Response Format
**Location:** `functions/createVendorConnectAccount` line 58  
**Severity:** CRITICAL  
**Problem:**
```javascript
// Returns wrong format:
return Response.json({ onboardingUrl: accountLink.url });

// But StripeConnectSetup.jsx expects:
if (res.status === 200 && res.data?.onboardingUrl) {
```

Component expects `res.data.onboardingUrl`, but function returns it directly.

**Impact:**
- Stripe Connect setup will fail silently
- Vendors cannot set up payout accounts
- Window redirect never happens

**Fix Required:**
Change response to include `success` flag:
```javascript
return Response.json({
  success: true,
  onboardingUrl: accountLink.url
});
```

---

## 🟠 HIGH SEVERITY ISSUES

### Issue #3: `createMarketShopCheckout` Returns Wrong Response Field
**Location:** `functions/createMarketShopCheckout` line 87  
**Severity:** HIGH  
**Problem:**
```javascript
// Function returns:
return Response.json({
  checkoutUrl: session.url,
  sessionId: session.id,
});

// But MarketShopSubscription expects:
if (res.data?.checkoutUrl) {
  window.location.href = res.data.checkoutUrl;
}
```

This actually works because the response structure is correct. **FALSE ALARM - NO FIX NEEDED HERE.**

---

### Issue #4: Stripe Version Mismatch in Backend Functions
**Location:** `functions/createMarketShopCheckout` line 1  
**Severity:** HIGH  
**Problem:**
```javascript
// Uses:
import Stripe from 'npm:stripe@^15.0.0';

// While createVendorConnectAccount uses:
import Stripe from 'npm:stripe@17.5.0';

// And other functions use the SDK secret:
Deno.env.get('STRIPE_SECRET_KEY')
```

**Impact:**
- Inconsistent Stripe API versions may cause compatibility issues
- Different functions may behave differently with same API calls
- May cause webhook payload differences

**Fix Required:**
Standardize all Stripe imports to use same version (recommend 17.5.0 or latest):
```javascript
import Stripe from 'npm:stripe@17.5.0';
```

---

### Issue #5: Missing `success` Field in Responses
**Location:** `functions/createVendorConnectAccount`  
**Severity:** HIGH  
**Problem:**
- Function returns only `onboardingUrl`, but StripeConnectSetup checks for `success` flag
- If response parsing fails, component doesn't properly detect error

**Current Code:**
```javascript
// Line 58:
return Response.json({ onboardingUrl: accountLink.url });

// StripeConnectSetup checks (line 25):
if (res.status === 200 && res.data?.onboardingUrl) {
```

This actually works but is fragile. Should include explicit `success` field.

**Fix Required:**
Add `success: true` to response:
```javascript
return Response.json({
  success: true,
  onboardingUrl: accountLink.url
});
```

---

## 🟡 MEDIUM SEVERITY ISSUES

### Issue #6: PaymentMethodManager Never Integrated
**Location:** Component exists but not used anywhere  
**File:** `components/marketshop/PaymentMethodManager.jsx`  
**Severity:** MEDIUM  
**Problem:**
- Component is fully functional and ready
- But never imported or rendered in MarketShopSubscription
- Users cannot update their payment methods through the UI

**Where It Should Go:**
In `MarketShopSubscription.jsx`, add to subscription section (around line 252):
```javascript
{activeTab === 'subscription' && (
  <div className="space-y-6">
    <MarketShopInquiries shop={shop} />
    <MarketShopSubscription shop={shop} />
    <PaymentMethodManager shopId={shop.id} ... /> {/* ADD HERE */}
    <StripeConnectSetup shop={shop} />
    ...
  </div>
)}
```

**Impact:** Users can't update payment methods without this integration

---

### Issue #7: Missing Subscription End Date Field
**Location:** `components/marketshop/MarketShopSubscription.jsx` line 108  
**Severity:** MEDIUM  
**Problem:**
```javascript
const nextBillingDate = shop.subscription_ends_at  // <-- This field doesn't exist
  ? new Date(shop.subscription_ends_at).toLocaleDateString(...)
  : 'N/A';
```

**MarketShop entity** has `wave_shop_subscription_period_end` but component looks for `subscription_ends_at`

**Fix Required:**
Change to correct field name:
```javascript
const nextBillingDate = shop.wave_shop_subscription_period_end
  ? new Date(shop.wave_shop_subscription_period_end).toLocaleDateString(...)
  : 'N/A';
```

---

## ✅ Non-Issues (False Positives)

### ✅ createMarketShopCheckout Response Format
- Initially suspected issue, but response structure is correct
- Component properly reads `res.data.checkoutUrl`

### ✅ PaymentMethodManager Function Integration
- Function `updateVendorPaymentMethod` is properly deployed
- Component correctly invokes it
- Issue is only that component isn't integrated into UI yet

---

## 📊 Summary Table

| # | Issue | Severity | File(s) | Type | Status |
|---|-------|----------|---------|------|--------|
| 1 | Legacy `subscription_status` field | 🔴 CRITICAL | MarketShopSubscription, MarketShopDashboard | Logic Error | Unfixed |
| 2 | createVendorConnectAccount response format | 🔴 CRITICAL | createVendorConnectAccount | Response Format | Unfixed |
| 3 | Stripe version mismatch | 🟠 HIGH | Multiple backend functions | Dependency | Unfixed |
| 4 | Missing `success` flag in responses | 🟠 HIGH | createVendorConnectAccount | Response Format | Unfixed |
| 5 | PaymentMethodManager not integrated | 🟡 MEDIUM | MarketShopSubscription | Integration | Unfixed |
| 6 | Wrong subscription date field name | 🟡 MEDIUM | MarketShopSubscription | Field Name | Unfixed |
| 7 | (Removed - false positive) | - | - | - | - |

---

## 🔧 Fix Priority

**DO IMMEDIATELY:**
1. **Issue #1:** Replace `subscription_status` with `wave_shop_subscription_status` everywhere
2. **Issue #2:** Add `success: true` to createVendorConnectAccount response

**DO SOON:**
3. **Issue #3:** Standardize Stripe version to 17.5.0 across all functions
4. **Issue #6:** Fix subscription date field reference

**NICE TO HAVE:**
5. **Issue #5:** Integrate PaymentMethodManager into UI

---

## 🎯 Recommended Fix Order

1. Fix Issue #1 (subscription_status) — affects feature gating
2. Fix Issue #2 (response format) — breaks Stripe Connect setup
3. Fix Issue #6 (date field) — affects UI display
4. Fix Issue #3 (Stripe version) — prevent future issues
5. Integrate PaymentMethodManager — nice feature

**Estimated time:** 20-30 minutes for all fixes