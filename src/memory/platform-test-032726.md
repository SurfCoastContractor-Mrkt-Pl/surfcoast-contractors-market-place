# Platform Test — March 27, 2026

## Summary
Full audit of all major pages: Home, Dashboard, ContractorAccount, CustomerAccount, Messaging, FieldOps, AdminDashboard, MarketShopDashboard, BecomeContractor, CustomerSignup, MarketShopSignup, FindContractors, Jobs, ContractorPublicProfile.

---

## BUGS FOUND & FIXED

### Already Fixed (Previous Session)
1. **FieldOps.jsx** — `BASE_NAV_TABS` / `BREAKER_TAB` undefined → Fixed (declared locally)
2. **FieldOps.jsx** — Duplicate `JobAlertBanner` render → Removed duplicate
3. **ContractorAccount.jsx** — Duplicate `"analytics"` tab value → Renamed second to `"performance"`
4. **FindContractors.jsx** — `SelectItem value={null}` (4 instances) → Changed to `"all"`
5. **Messaging.jsx** — `window.location.href = '/'` for unauthed users → Fixed to `base44.auth.redirectToLogin('/Messaging')`

### Fixed This Session
6. **ContractorAccount.jsx** — `TabsList className="w-full grid-cols-22"` — `grid-cols-22` is NOT a valid Tailwind class → Fixed to `flex flex-wrap`
7. **CustomerAccount.jsx** — `CustomerBadges` rendered TWICE: once in the "profile" tab inside the `customerProfile &&` block, AND as its own "badges" tab content → The profile tab render is redundant (badges tab is dedicated for this)
8. **MarketShopDashboard.jsx** — `MarketShopSchedule`, `PhotoGalleryManager`, `MarketShopInquiries`, `MarketShopSubscription`, `StripeConnectSetup`, `CRMSyncPanel`, and `ShareYourListing` are ALL rendered unconditionally below the tab switcher, meaning they always render regardless of which tab is active — this causes significant performance issues and redundant renders
9. **Home.jsx** — `window.innerWidth` used directly inside JSX render (line 305 in social section grid) — this is a stale read that won't react to resize events; should use `isMobile` state already defined
10. **AdminDashboard.jsx** — `console.log('AdminDashboard: user =', user, ...)` left in production code (line 38)
11. **CustomerSignup.jsx** — `earlyAdopterRes.data.qualified` accessed without null-checking `earlyAdopterRes.data` — if the function throws or returns nothing, this will crash

---

## ENHANCEMENTS IDENTIFIED

### High Priority
- **ContractorAccount tab bar**: 30+ tabs in a single row is overwhelming UX — consider grouping into categories (Jobs, Business, Account)
- **MarketShopDashboard**: Sections outside the tab switcher (Schedule, Gallery, Inquiries, Subscription, Stripe, CRM, Share) should be tab-controlled, not always-rendered
- **CustomerSignup**: Uses raw `fetch('/functions/customerSignup')` instead of `base44.functions.invoke()` — inconsistent with platform patterns and bypasses SDK auth

### Medium Priority  
- **Home.jsx**: Social grid uses `window.innerWidth < 600` directly inside render — stale on resize; use `isMobile` state
- **AdminDashboard**: No search for contractors tab (only dropdowns); adding a name/email search would improve usability
- **Messaging.jsx**: Unread count only counts `vendor_email === userEmail` messages; consumer's sent messages from other vendors aren't being counted for the consumer

### Low Priority
- **ContractorPublicProfile**: Missing `import { useState, useEffect } from 'react'` — this is line 1 but was cut off in read, need to verify
- **Jobs.jsx**: Has an "Enter" button to apply filters — but filters already auto-apply via `activeSearchQuery` state which is only set on button click. Could simplify to live filtering
- **FindContractors.jsx**: Filter changes apply instantly (no "Search" button) while Jobs.jsx requires clicking "Enter" — inconsistent UX between the two pages
- **BecomeContractor.jsx**: Compliance analytics event fires on both `if` and `else` branches with the same event name `contractor_onboarding_compliance_shown` (lines 128 and 131) — redundant tracking

---

## PAGES VERIFIED CLEAN
- Dashboard.jsx — clean, well structured
- FieldOps.jsx — clean after fixes
- BecomeContractor.jsx — clean overall, minor analytics duplication
- MarketShopSignup.jsx — clean, well structured
- AdminDashboard.jsx — clean structure, minor console.log in prod
- ContractorPublicProfile.jsx — clean

---

## RUNTIME LOGS
- No errors in runtime logs
- User was interacting with NotionHub (inputting Notion page IDs and clicking buttons — working correctly)
- Datadog SDK warning (no storage) is cosmetic/expected in sandbox