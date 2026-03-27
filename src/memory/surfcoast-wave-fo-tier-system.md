# SurfCoast Wave FO Tier System

**Last Updated:** March 27, 2026

## Overview
SurfCoast Wave FO is a tiered field operations platform designed to support contractors through various stages of professional growth. The system distinguishes between **non-licensed contractors** (segmented into progressive tiers) and **Licensed Sole Proprietors** (exclusive top tier with full feature access).

---

## Wave FO Tiers

### 1. Wave Starter ($19/month)
**Target:** New contractors and platform explorers

**Core Features:**
- Job Scheduling & Management (up to 5 concurrent jobs)
- Basic Invoicing (up to 10 invoices/month)
- Text-only messaging for active jobs
- Mobile app access (basic view)

**Exclusions:** Lead tracking, document storage, project tracking, analytics, contract management, team management, specialized templates, priority support

---

### 2. Wave Pro ($39/month)
**Target:** Growing contractors managing multiple projects and clients

**Includes All Wave Starter Features, PLUS:**
- Unlimited Job Scheduling & Management
- Unlimited Invoicing
- Basic Lead Tracking & Pipeline Management
- Document Storage & Organization (1GB limit)
- File attachment support in messaging
- Mobile app access (full basic functions)

**Exclusions:** Project tracking/reporting, advanced analytics, specialized contracts, team management, advanced templates, priority support

---

### 3. Wave Max ($59/month)
**Target:** Established contractors seeking comprehensive operations optimization

**Includes All Wave Pro Features, PLUS:**
- Project Tracking & Completion Reporting
- Advanced Analytics Dashboards
- Standard Document Templates (non-specialized)
- Enhanced Document Storage (5GB limit, basic version control)
- Mobile app access (full suite including reports)

**Exclusions:** CSLB contract management, team management, priority support, HIS license tools

---

### 4. Licensed Sole Proprietor - Wave FO Premium ($100/month) or Bundle ($125/month)
**Target:** Licensed sole proprietors (HIS license verified)

**Includes ALL Features from Wave Max, PLUS:**
- CSLB Contract Management (California State Contractors License Board compliance)
- Full Team Management (employees, subcontractors, task delegation, time tracking, permissions)
- Priority Support (dedicated channels, faster response)
- HIS License-Specific Document Management (verification, compliance tools)
- Optional: Residential Wave Bundle ($125/month) adds unlimited communication capabilities

---

## Key Distinctions

### Wave FO Plans vs. Facilitation Fee Tiers
The platform uses two separate tiering systems that work in parallel:

1. **Wave FO Plans** (monthly subscription for feature access): Starter, Pro, Max, LSP
2. **Facilitation Fee Tiers** (based on cumulative annual earnings): Bronze (2%), Silver (10%), Gold (15%)

These are independent systems. A contractor on Wave Starter may be in the Gold facilitation fee tier if they've earned $50K+ annually, and vice versa.

---

## Progression Logic

**For Non-Licensed Contractors:**
- All contractors start with Wave Starter access at signup
- Advancement is NOT automatic based on job completion
- Contractors manually select which plan to subscribe to
- Plan selection is independent of facilitation fee tier

**For Licensed Sole Proprietors:**
- Verified HIS license holders unlock Wave FO Premium/Bundle access immediately
- They have access to all features and specialized tools
- They still pay facilitation fees based on annual earnings (Bronze/Silver/Gold)

---

## Stripe Integration

**Wave Starter:** `STRIPE_WAVE_STARTER_PRICE_ID` (to be created)  
**Wave Pro:** `STRIPE_WAVE_PRO_PRICE_ID` (to be created)  
**Wave Max:** `STRIPE_WAVE_MAX_PRICE_ID` (to be created)  
**Wave FO Premium:** `STRIPE_RESIDENTIAL_WAVE_PRICE_ID` (existing: $100/month)  
**Wave FO Bundle:** `STRIPE_RESIDENTIAL_WAVE_BUNDLE_PRICE_ID` (existing: $125/month with communication)

---

## Platform Language Requirements

### Terminology
- Refer to subscription access as **"Wave FO Plans"** or **"Wave Starter/Pro/Max"**
- Refer to earnings-based costs as **"Facilitation Fee Tiers"** or **"Bronze/Silver/Gold"**
- Avoid using "tier" alone—always clarify which system you're referring to
- Licensed sole proprietors = **"Wave FO Premium"** or **"Wave FO Bundle"**

### Documentation Updates
- **PricingGuide:** Display Wave FO plans as primary contractor offering
- **Terms of Service:** Update Section 10 to include Wave FO plan details
- **Contractor Dashboards:** Show active plan and path to upgrades
- **Internal Docs:** Maintain clear distinction between both tiering systems

---

## Implementation Status

- [ ] Create Wave Starter, Pro, Max products in Stripe
- [ ] Update PricingGuide page with Wave FO plans
- [ ] Update Terms of Service Section 10 with Wave FO pricing
- [ ] Create contractor tier selection UI
- [ ] Add plan display to contractor dashboards
- [ ] Update all internal documentation
- [ ] Test tier access and feature gating