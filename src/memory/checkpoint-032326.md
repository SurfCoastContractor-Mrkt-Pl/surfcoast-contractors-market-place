# Platform Checkpoint — 2026-03-23

## Recent Changes

### Footer Branding (layout + Home page)
- **Layout footer** (`layout`): Restored the stacked "SurfCoast / MARKETPLACE" text logo + tagline in the footer brand block.
  - Grid restored to `lg:grid-cols-5` with brand area spanning `sm:col-span-2 lg:col-span-2`
  - Logo: `text-xl font-black text-white tracking-tight` + `text-[9px] font-bold tracking-[3px] text-slate-400 uppercase` (MARKETPLACE)
  - Tagline: `"Premium marketplace connecting exceptional professionals with discerning clients."` in `text-slate-300 text-xs`

- **Home page footer** (`pages/Home`): Added matching brand block above the links row.
  - Centered column with stacked SurfCoast / MARKETPLACE text + tagline
  - SurfCoast: `fontSize:"22px", fontWeight:"800", color:"#ffffff"`
  - MARKETPLACE: `fontSize:"9px", fontWeight:"700", letterSpacing:"3px", color:"rgba(255,255,255,0.5)"`
  - Tagline: `color:"rgba(255,255,255,0.45)", fontSize:"12px", textAlign:"center"`

---

## Brand Identity Summary

### Logo Treatment (standard across all surfaces)
- Stacked text: "SurfCoast" (bold, large) over "MARKETPLACE" (tiny, tracked, muted)
- Colors vary by background:
  - On dark (slate-800, navy): white + slate-400
  - On Home page dark overlay: white + rgba(255,255,255,0.5)
  - On nav header: white + rgba(255,255,255,0.6)

### Tagline
"Premium marketplace connecting exceptional professionals with discerning clients."

---

## Active Pages & Key Components

### Home page (`pages/Home`)
- Outer wrapper uses `position:"fixed", inset:0, overflowY:"auto", overflowX:"hidden"` to fill the full viewport with zero gap, bypassing any parent layout constraints
- Full-screen dark overlay with beach/ocean BG (`position:"fixed", inset:0`)
- Sticky header with stacked logo + Enter dropdown (Login/Signup, About Us)
- Two CTA cards: "Find a Pro" (blue) + "Join as a Pro" (amber)
- CampaignAdBanner + FarmersMarketBanner components
- Trust bar with 4 icons
- Social QR section (Instagram, Facebook, Facebook Group)
- Footer with: brand logo block → links row → legal disclaimer strip
- **NOT wrapped in LayoutWrapper** in App.jsx — standalone route `<Route path="/" element={<Home />} />`

### Layout footer (all non-Home pages)
- `bg-slate-800` dark footer
- 5-column grid: brand (2 cols) + For Contractors + For Clients (conditional) + Markets & Vendors + Connect (social icons)
- Global legal disclaimer
- Bottom bar: copyright + Terms + Privacy + Feedback button

### About page (`pages/About`)
- Sunset gradient background (top section)
- Dark navy founder section (`#0d1b2a`)
- Orange (`#F97316`) accent color throughout
- See `memory/checkpoint-about-032326.md` for full detail

---

## Design System Reference
- Primary blue: `#1E5A96` / `#1d6fa4`
- Amber/orange accent: `#d97706` / `#F97316`
- Dark navy: `#0d1b2a` / `#0a1628`
- Footer bg: `bg-slate-800` (layout) / `rgba(10,22,40,0.75)` (Home)
- Font: Inter (body), Playfair Display (contractor profiles), Montserrat (market shops)
- See `memory/platform-design-system.md` for full tokens

---

## Routing Fix — Home Page White Nav Bar (2026-03-23)

**Problem:** On the live published app, a white Layout nav bar was appearing over the Home page.

**Root cause:** `"Home": Home` was included in the `PAGES` object in `pages.config.js`. The `pagesConfig` loop in `App.jsx` was creating a **second Layout-wrapped route** at `/Home`, and the `mainPage: "Home"` setting was causing the published app to render the Layout-wrapped version instead of the standalone `<Route path="/" element={<Home />} />`.

**Fix applied:**
- Removed `"Home": Home` from the `PAGES` object in `pages.config.js`
- Removed the `import Home from './pages/Home'` from `pages.config.js`
- Set `mainPage: null` in `pagesConfig` (Home is handled exclusively by the explicit route in `App.jsx`)
- Home is now **only** served by: `<Route path="/" element={<Home />} />` in `App.jsx` — no Layout wrapper

---

## Platform Notes
- Stripe: Live mode, real payments active
- Auth: App is public (no login required for browsing)
- Routing: `pages.config.js` is NOT auto-generated — all new routes must be added manually as `<Route>` elements in `App.jsx`
- **IMPORTANT:** Do NOT add `Home` back to the `PAGES` object in `pages.config.js` — it must remain only in the explicit route in `App.jsx`
- Test DB available (set `data_env="dev"` for test operations)