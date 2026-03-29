# Wave FO Complete Tier System & Feature Mapping
**Last Updated:** March 29, 2026
**Status:** Strategic Feature Distribution Planning

---

## COMPLETE WAVE FO TIER STRUCTURE

### 1. Wave Starter ($19/month)
**Target:** New contractors and platform explorers

**Current Features:**
- Job Scheduling & Management (up to 5 concurrent jobs)
- Basic Invoicing (up to 10 invoices/month)
- Text-only messaging for active jobs
- Mobile app access (basic view)

**NEW FEATURES ADDED:**
- Basic Customer Portal (view-only: job status, invoices, communication)
- Simple Availability Calendar (manual slot management)
- Basic Field Notes & Photo Upload

**Exclusions:** Lead tracking, document storage, project tracking, analytics, contract management, team management, specialized templates, advanced scheduling, inventory, advanced automations, accounting integrations, priority support

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

**NEW FEATURES ADDED:**
- Enhanced Customer Portal (interactive: approve scopes, request revisions, payment history)
- Smart Availability Management (prevent double-bookings, suggest available times)
- Basic Inventory Tracking (up to 50 items, low-stock alerts via email)
- Automated Email Workflows (job status updates, invoice reminders, review requests)
- CSV Export/Import for QuickBooks/Sage (manual data synchronization)

**Exclusions:** Project tracking/reporting, advanced analytics, specialized contracts, team management, advanced templates, advanced scheduling AI, real-time inventory sync, priority support

---

### 3. Wave Max ($59/month)
**Target:** Established contractors seeking comprehensive operations optimization

**Includes All Wave Pro Features, PLUS:**
- Project Tracking & Completion Reporting
- Advanced Analytics Dashboards
- Standard Document Templates (non-specialized)
- Enhanced Document Storage (5GB limit, basic version control)
- Mobile app access (full suite including reports)

**NEW FEATURES ADDED:**
- Advanced Customer Portal (custom branding, feedback collection, photo gallery)
- AI-Assisted Scheduling (intelligent job-to-slot matching, conflict prevention)
- Comprehensive Inventory Management (unlimited items, categorization, usage tracking)
- Advanced Workflow Automations (conditional triggers, multi-step sequences, status-based actions)
- One-Way QuickBooks Integration (automated daily sync of completed jobs as invoices)

**Exclusions:** CSLB contract management, team management, priority support, HIS license tools, Sage integration, real-time two-way sync

---

### 4. Wave FO Premium ($100/month) or Bundle ($125/month)
**Target:** Licensed sole proprietors (HIS license verified)

**Includes ALL Features from Wave Max, PLUS:**
- CSLB Contract Management (California State Contractors License Board compliance)
- Full Team Management (employees, subcontractors, task delegation, time tracking, permissions)
- Priority Support (dedicated channels, faster response)
- HIS License-Specific Document Management (verification, compliance tools)

**NEW FEATURES ADDED:**
- Full Customer & Client Portal Suite (white-label ready, custom workflows, advanced analytics)
- Enterprise-Grade Scheduling (multi-team dispatching, resource optimization, travel time calculation)
- Enterprise Inventory Management (real-time asset tracking, barcode integration, multiple locations)
- Advanced Workflow Automations (unlimited sequences, third-party webhook integration, custom logic)
- Two-Way QuickBooks & Sage Integration (real-time sync, automated categorization, tax preparation tools, expense tracking)
- Optional: Residential Wave Bundle ($125/month) adds unlimited communication capabilities

---

## FEATURE MAPPING SUMMARY TABLE

| Feature | Starter | Pro | Max | Premium |
|---------|---------|-----|-----|---------|
| Basic Customer Portal | ✓ | ✓ | ✓ | ✓ |
| Enhanced Customer Portal | | ✓ | ✓ | ✓ |
| Advanced Customer Portal | | | ✓ | ✓ |
| Simple Availability | ✓ | ✓ | ✓ | ✓ |
| Smart Availability | | ✓ | ✓ | ✓ |
| AI Scheduling | | | ✓ | ✓ |
| Enterprise Scheduling | | | | ✓ |
| Basic Inventory (50 items) | | ✓ | ✓ | ✓ |
| Standard Inventory (unlimited) | | | ✓ | ✓ |
| Enterprise Inventory | | | | ✓ |
| Email Workflows | | ✓ | ✓ | ✓ |
| Advanced Automations | | | ✓ | ✓ |
| Enterprise Automations | | | | ✓ |
| CSV Export/Import QB/Sage | | ✓ | ✓ | ✓ |
| One-Way QB Integration | | | ✓ | ✓ |
| Two-Way QB & Sage Integration | | | | ✓ |

---

## IMPLEMENTATION STRATEGY

### Cost Management Approach
1. **Base44 Native Features (FREE):** Leverage existing entities, automations, and backend functions
   - Customer portal = new page + existing entities (ScopeOfWork, ProjectMessage, Payment)
   - Availability management = AvailabilitySlot entity + simple validation logic
   - Inventory tracking = new Equipment entity + low-stock automations
   - Email workflows = entity automations + Core.SendEmail integration
   - CSV export = backend function generating CSV from existing data

2. **QuickBooks/Sage Integration (MINIMAL COST):**
   - CSV export/import (Wave Pro) = No API cost, user-driven
   - One-way integration (Wave Max) = Low-volume API calls via backend function
   - Two-way integration (Premium) = Batched API calls, optimized for cost

3. **AI-Assisted Scheduling (Wave Max):** Uses Base44's InvokeLLM integration (credit-based pricing, shared across features)

### Development Priorities
1. **Phase 1 (Immediate):** Enhanced Customer Portal, Basic Inventory, Email Workflows
2. **Phase 2:** CSV Export/Import, Simple Availability Enhancements
3. **Phase 3:** One-Way QuickBooks Integration, AI Scheduling
4. **Phase 4:** Two-Way Integrations, Enterprise Features

---

## TIER PROGRESSION PATH FOR USERS

**Non-Licensed Contractors:**
- Start at Wave Starter (exploration phase)
- Upgrade to Wave Pro (when managing 5+ concurrent jobs)
- Upgrade to Wave Max (when seeking automation & accounting integration)

**Licensed Sole Proprietors:**
- Unlock Wave FO Premium/Bundle immediately upon HIS verification
- Full feature access, team management, enterprise integrations

---

## BUSINESS METRICS

### No Price Increase Strategy
- **Starter:** $19/month (unchanged)
- **Pro:** $39/month (unchanged)
- **Max:** $59/month (unchanged)
- **Premium:** $100-125/month (unchanged)

### Competitive Positioning
- Enhanced customer portal + inventory tracking (Pro level) = Feature parity with ServiceTitan's basic tier
- AI scheduling + two-way accounting (Max level) = Competitive advantage at $59/month
- Enterprise integrations (Premium) = Full parity with industry leaders

---

## ENTITIES REQUIRED

### New Entities
- `Equipment` (contractor asset tracking for inventory)

### Enhanced/Extended
- `AvailabilitySlot` (improved scheduling logic)
- `ProjectMessage` (customer portal messaging)
- `ScopeOfWork` (customer approval workflows)

### Automations Required
- Low-stock inventory alerts
- Job status email notifications
- Invoice reminder workflows
- Review request automations

---

## BACKEND FUNCTIONS REQUIRED

### Priority 1 (Immediate)
- `exportCustomerPortalData` (portal backend queries)
- `sendJobStatusEmail` (automated notifications)
- `checkLowStockInventory` (daily alert check)
- `exportToCSVForQuickBooks` (CSV generation)

### Priority 2 (Phase 2-3)
- `syncToQuickBooks` (one-way integration, Wave Max)
- `syncFromQuickBooks` (two-way integration, Premium)
- `syncToSage` (two-way integration, Premium)
- `aiScheduleOptimizer` (AI-assisted scheduling)

---

## DOCUMENTATION & REFERENCE

This document serves as the **single source of truth** for Wave FO tier structure and feature mapping. Update this file when:
- New features are added to any tier
- Pricing changes
- Integration strategies evolve
- Implementation phases complete

**Last Review:** March 29, 2026
**Next Review:** Upon completion of Phase 1 implementation