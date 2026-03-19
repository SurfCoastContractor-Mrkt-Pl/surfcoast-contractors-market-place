# SurfCoast Marketplace — Platform Design System Memory

## Brand Identity
- **Platform Name:** SurfCoast Marketplace (NEVER "ContractorHub" or any other name)
- **Tagline:** "The Trades Marketplace"
- **Copyright:** © 2026 SurfCoast Marketplace. All rights reserved.

---

## Global Color Palette

| Token | Value | Usage |
|---|---|---|
| Dark ocean base | `#0a1628` | Page background |
| Blue accent | `#1d6fa4` / `#1E5A96` | Primary CTA, links, customer-side |
| Amber accent | `#d97706` / `#b45309` | Contractor-side CTA, highlights |
| Green success | `#4ade80` | Check marks, success states |
| White primary text | `#ffffff` | Headings on dark backgrounds |
| White secondary text | `rgba(255,255,255,0.7)` | Body copy on dark backgrounds |
| White muted text | `rgba(255,255,255,0.4–0.5)` | Footer, captions, muted |
| White subtle | `rgba(255,255,255,0.08–0.15)` | Borders, dividers on dark bg |

---

## Background System (Home & BecomeContractor pages)

```
Background image (fixed):
  URL: https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b5d136d5baa9e2c5f01224/f64fccdce_generated_image.png
  position: fixed, cover, center top

Overlay gradient:
  Home: linear-gradient(to bottom, rgba(10,22,40,0.65) 0%, rgba(10,22,40,0.45) 35%, rgba(10,22,40,0.80) 100%)
  BecomeContractor: linear-gradient(to bottom, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.6) 40%, rgba(10,22,40,0.85) 100%)

Root container: background: #0a1628 (fallback)
```

---

## Header (Dark Ocean Theme — Home & BecomeContractor)

```jsx
<header style={{
  position: "relative", zIndex: 10,
  display: "flex", alignItems: "center",
  padding: "12px 16px",
  background: "rgba(10,22,40,0.5)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(255,255,255,0.08)"
}}>
  {/* Logo */}
  <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
    <span style={{ fontSize:'clamp(14px,4vw,17px)', fontWeight:'800', color:'#ffffff', letterSpacing:'-0.5px', lineHeight:1 }}>SurfCoast</span>
    <span style={{ fontSize:'clamp(7px,2vw,10px)', fontWeight:'700', letterSpacing:'1.5px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', lineHeight:1, marginLeft:'8px' }}>MARKETPLACE</span>
  </div>
  {/* Nav — right side */}
</header>
```

---

## Footer (Dark Ocean Theme — Home & BecomeContractor)

```jsx
<div style={{
  position:"relative", zIndex:2,
  display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center",
  gap:"8px", padding:"12px 24px",
  background:"rgba(10,22,40,0.75)",
  borderTop:"1px solid rgba(255,255,255,0.07)",
  fontSize:"12px", color:"rgba(255,255,255,0.35)"
}}>
  <span>© 2026 SurfCoast Marketplace</span>
  <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
  <Link to="/Terms" style={{ color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>Terms</Link>
  <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
  <Link to="/PrivacyPolicy" style={{ color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>Privacy</Link>
</div>
```

---

## BecomeContractor Page Layout

### Page structure
```
<div> root (position:relative, minHeight:100vh, flex col, background:#0a1628)
  <div> fixed BG image (zIndex:0)
  <div> fixed overlay gradient (zIndex:1)
  <header> (zIndex:10) — SurfCoast logo + Back button
  [Admin preview banner — conditionally shown]
  <div> Hero section (zIndex:2, centered, max-width:700px)
    HardHat icon in amber circle
    H1: "Become a Contractor"
    P: subheadline
    Feature badges row (Free to join, Identity verified, etc.)
  <div> Form container (zIndex:2, max-width:720px, padding 0 16px 48px)
    <style> CSS overrides for .contractor-form dark theme
    <form className="contractor-form">
      Section card 1: Basic Information (glass card)
      Section card 2: Professional Details (glass card)
        — includes Identity Verification, Credentials, Minor Consent,
          Platform Fee box, Single-Person Policy box
    <button> Submit (full-width amber gradient)
  <div> Footer
```

### Glass card sections (form sections)
```
style={{
  background: "rgba(10,22,40,0.55)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  padding: "28px",
  marginBottom: "16px"
}}
Section heading: fontSize:16px, fontWeight:700, color:#ffffff, borderBottom:1px solid rgba(255,255,255,0.1)
```

### Submit button
```
background: linear-gradient(135deg, #d97706 0%, #b45309 100%)
color: #fff, width:100%, padding:16px, borderRadius:12px, fontSize:16px, fontWeight:700
boxShadow: 0 4px 24px rgba(217,119,6,0.35)
```

### CSS overrides for dark form theme (.contractor-form class)
```css
label                        → color: rgba(255,255,255,0.85)
.text-slate-500              → color: rgba(255,255,255,0.45)
.text-slate-900              → color: #ffffff
.bg-slate-50                 → background: rgba(255,255,255,0.05), border: rgba(255,255,255,0.1)
input, textarea, select      → background: rgba(255,255,255,0.07), border: rgba(255,255,255,0.2), color: #fff
::placeholder                → color: rgba(255,255,255,0.35)
.bg-amber-50                 → background: rgba(217,119,6,0.12), border: rgba(217,119,6,0.4)
.bg-amber-50 *               → color: rgba(255,200,100,0.9)
.bg-red-50                   → background: rgba(220,38,38,0.12), border: rgba(220,38,38,0.4)
.bg-red-50 *                 → color: rgba(255,160,160,0.9)
.bg-blue-50                  → background: rgba(29,111,164,0.15), border: rgba(29,111,164,0.4)
.bg-blue-50 *                → color: rgba(150,210,255,0.9)
.bg-white                    → background: rgba(255,255,255,0.06)
.bg-white *                  → color: rgba(255,255,255,0.85)
.bg-amber-100                → background: rgba(217,119,6,0.2)
.text-amber-700              → color: #fbbf24
.bg-slate-100                → background: rgba(255,255,255,0.08)
.text-slate-700              → color: rgba(255,255,255,0.8)
.border-slate-200            → border-color: rgba(255,255,255,0.15)
[data-radix-select-trigger]  → background: rgba(255,255,255,0.07), border: rgba(255,255,255,0.2), color: #fff
```

---

## Home Page Layout

### Structure
```
root div (position:relative, minHeight:100vh, flex col, background:#0a1628, fontFamily:Inter)
  fixed BG image (zIndex:0)
  fixed overlay (zIndex:1)
  <header> (zIndex:10) — logo + Markets & Vendors nav link + Sign In button
  <main> (zIndex:2, flex col, align center, padding responsive)
    H1: "The Trades Marketplace"
    P: subheadline
    <CampaignAdBanner />
    Two-card row (max-width:900px):
      Card 1: "Find a Pro" — blue border rgba(45,140,200,0.4), blue CTA #1d6fa4
      OR divider (vertical desktop, horizontal mobile)
      Card 2: "Join as a Pro" — amber border rgba(217,119,6,0.4), amber CTA #d97706
    <FarmersMarketBanner />
  Trust badge strip (4 icons, zIndex:2)
  <footer> (zIndex:2) — copyright, Terms, Privacy, Markets links
  Disclaimer strip (black/55 bg)
```

### Home cards style
```
background: rgba(10,22,40,0.5)
backdropFilter: blur(18px)
borderRadius: 16px
padding: 32px 28px (desktop) / 22px 18px (mobile)
transition: all 0.22s ease
Hover: translateY(-2px) + deeper boxShadow
```

---

## Layout (Non-Home pages — standard nav + footer)

### Navbar
```
bg-white backdrop-blur-sm border-b border-slate-200/50
Logo: SurfCoast image (69x69px) + text column
Nav links: ghost buttons, active = bg-blue-50 color #1E5A96
CTA buttons: background #1E5A96 (blue), white text
```

### Footer
```
bg-slate-800, text-slate-50
Grid: 5 cols (logo+description, For Contractors, For Clients, Connect socials)
Legal disclaimer paragraph
Bottom: copyright + Terms + Privacy + Feedback button
```

---

## Typography

| Element | Style |
|---|---|
| Hero H1 (dark pages) | clamp(28px,6vw,60px), weight 800, color #fff, letterSpacing -1.5px |
| Section H2 (form cards) | 16px, weight 700, color #ffffff |
| Body (dark bg) | rgba(255,255,255,0.7), lineHeight 1.6 |
| Labels (dark form) | rgba(255,255,255,0.85) |
| Captions/muted | rgba(255,255,255,0.35–0.45) |
| Font family | 'Inter', 'Segoe UI', sans-serif |

---

## Key Policies & Language

### Single-Person Freelancer Policy (BecomeContractor)
```
Title: "Single-Person Freelancer Policy"
Body: "By registering on SurfCoast Marketplace, you confirm that you are a single individual freelancer.
Companies, businesses, partnerships, crews, or any group of two or more persons are strictly prohibited.
Any contractor found operating with workers, subcontractors, or associates will be permanently banned
from the platform without notice."

Checkbox label: "I confirm that I am a single individual and not a company, crew, partnership, or
multi-person entity. I understand that violation of this policy will result in a permanent ban from
SurfCoast Contractor Market Place."
```

### Platform Fee
- 18% facilitation fee on completed jobs covers payment processing and platform maintenance only
- SurfCoast Marketplace and all associates hold no responsibility for any outcomes, disputes, or damages
- All users engage entirely at their own risk and are solely liable for their agreements
- Example: $1,000 job → contractor receives $820

### Trial
- Free 2-week trial for both contractors and customers

---

## Routing Notes
- pages.config.js is NOT auto-generated — all new routes must be explicit `<Route>` in App.jsx
- New routes outside the pagesConfig loop need LayoutWrapper applied manually if needed
- Public paths (no auth required): /, /Home, /Terms, /PrivacyPolicy, /MarketDirectory, /ReferralSignup, /FindContractors, /Jobs, /Blog, /BlogDetail, /ContractorProfile, /Contractors, /JobDetails, /Landing, /BecomeContractor, /QuickJobPost, /shop/*, /MarketShopProfile/*

---

## Key Image Assets
- **Hero BG:** https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b5d136d5baa9e2c5f01224/f64fccdce_generated_image.png
- **Logo image:** https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/e463c3ecd_SGN_05_15_2022_1652641626318_Original.jpeg (69x69px in nav)