# Checkpoint - March 25, 2026 (Latest Updates)

## Overview
Recent session focused on platform terminology clarification, routing fixes, and metric/profile strategy decisions.

---

## Recent Additions & Changes

### 1. Routing Fix — Admin Pages (March 25, 2026)
**File Modified:** `App.jsx` and `pages.config.js`

**Changes:**
- `Admin` and `AdminDashboard` pages were missing from the app routing config and returning 404 errors.
- Both pages are now explicitly registered as `<Route>` elements in `App.jsx`.
- Issue identified: `pages.config.js` is no longer auto-generated for this app. All new routes must be added manually as explicit `<Route>` elements in `App.jsx`.

---

### 2. Platform Terminology Decision — Customer → Client (March 25, 2026)
**Status: Discussed / Pending Implementation**

**Decision made:**
Three distinct user profile types are now officially defined:
- **Contractor** — A worker or service provider.
- **Client** — Someone looking to hire a contractor (previously called "Customer").
- **Consumer** — Someone who shops in the MarketShop only (no contractor interaction).

**Clarification:**
- All UI references to "Customer" in the context of hiring a worker should be updated to "Client."
- "Consumer" is reserved exclusively for MarketShop shoppers.
- Entity names (`CustomerProfile`, `customer_email`, etc.) may remain for now to avoid breaking data integrity, but display labels, buttons, and UI text should reflect "Client."

**Pending:** Full UI text replacement of "Customer" → "Client" across pages and components.

---

### 3. Unique User Metrics Strategy (March 25, 2026)
**Status: Discussed / Architectural Decision**

**Decision made:**
- Each user is registered **once** in the base `User` entity — their core information (email, name) is never duplicated.
- A user may hold **up to 3 profiles max**:
  1. **Contractor** profile (via `Contractor` entity)
  2. **Client** profile (via `CustomerProfile` entity)
  3. **Consumer** profile (via `CustomerProfile` or a dedicated consumer entity, for MarketShop only)
- Metrics (unique user counts, registrations) should always be based on the `User` entity to avoid double-counting.
- Profile counts per user can be tracked separately (e.g., how many of the 3 profile slots a user has filled).

---

### 4. Account Dropdown - Switch Profile Section (March 24, 2026)
**File Modified:** `layout.jsx`

**Changes:**
- Added `hasCustomerProfile` state to track if logged-in user has a `CustomerProfile` record.
- Added `CustomerProfile.filter({ email: user.email })` check alongside existing Contractor and MarketShop checks (all fetched in parallel).
- Replaced the generic "Browse & Shop" toggle button with a conditional "Consumer" link that:
  - Only appears if the user has a registered `CustomerProfile`
  - Links directly to `/ConsumerHub`
  - Uses 🛒 icon for visual distinction
- Applied the same change to both **desktop dropdown** and **mobile menu** Switch Profile sections.

---

### 5. Google Docs Service Agreement Generation (March 23, 2026)
**Files Created:**
- `functions/generateContractorAgreement/entry.ts`
- `components/contractor/ServiceAgreementGenerator.jsx`

**Features:**
- Creates customized Google Docs agreements with contractor pre-filled information
- Automatically shares documents with contractors
- Sends email notifications with shareable links
- Integrates with Google Docs API via OAuth connector

---

### 6. Google Search Console Analytics Dashboard (March 23, 2026)
**Files Created:**
- `functions/fetchSearchConsoleData.js`
- `pages/SearchAnalytics.jsx`

**Features:**
- Top contractor search queries with impressions, clicks, CTR
- Average ranking position for queries
- Top performing pages breakdown
- Configurable date range (30/90/180 days)

**Route:** `/SearchAnalytics` (added to `App.jsx`)

---

### 7. Hardcoded URL Removal & SDK Migration (March 23, 2026)
- `pages/TimedChatPage.jsx` — Migrated to `base44.functions.invoke('redactMessage', {...})`
- `components/contractor/TrialStatusBanner.jsx` — Migrated to `base44.functions.invoke('activateTrial', {...})`

---

## Authorized Integrations
- `google_search_console` - Read-only web master data
- `googledocs` - Document creation and sharing

## Architecture Notes
- Public-facing app (no login required by default)
- All hardcoded URLs removed from frontend — fully SDK-based
- Switch Profile section in nav dynamically shows only profiles the user has registered
- **CRITICAL ROUTING NOTE:** `pages.config.js` is no longer auto-generated. Every new page MUST be added as an explicit `<Route>` in `App.jsx`. The pagesConfig loop only covers old pages.
- Each user counts once in metrics (via `User` entity). Profile counts tracked separately.

## Platform Terminology (Official)
| Old Term | New Term | Scope |
|----------|----------|-------|
| Customer | Client | Someone hiring a contractor |
| Consumer | Consumer | MarketShop shopper only |
| Contractor | Contractor | Service provider |

## Database Entities Referenced
- `User` — Single source of truth for all registered users (metrics base)
- `Contractor` — Contractor profile (1 per user max)
- `CustomerProfile` — Client profile (1 per user max, also used for Consumer role)
- `MarketShop` — Vendor/MarketShop profile (1 per user max)
- `ScopeOfWork` — Scope-specific agreements
- `TimedChatSession` & `TimedChatMessage` — Chat functionality
- `EarlyAdopterWaiver` — Public count endpoint