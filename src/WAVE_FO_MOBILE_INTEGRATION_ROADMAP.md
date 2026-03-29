# Wave FO: Mobile Optimization & Integration Roadmap
**Date:** March 29, 2026  
**Priority:** CRITICAL — Mobile-first field operations platform

---

## PHASE 1: Mobile Performance & UX Hardening (Immediate)

### 1.1 Network Resilience
- **Offline-First Architecture**: Extend offline cache to cover:
  - Job list and detail caching
  - Invoice templates and calculations
  - Photo uploads queue (retry on reconnect)
  - Message drafts persistence
- **Retry Logic**: Implement exponential backoff for failed requests
- **Network Detection**: Visual indicators for poor connectivity (existing: online/offline dot)

### 1.2 Touch & Form Optimization
- **Button Sizes**: Ensure all interactive elements are minimum 44x44px
- **Input Fields**: Increase input padding and font size (16px minimum to prevent iOS zoom)
- **Scroll Performance**: Replace heavy re-renders with virtualization for long job lists
- **Gesture Support**: Long-press photo gallery for quick actions

### 1.3 Performance Metrics
- **Lazy Loading**: Defer non-critical images and components
- **Bundle Splitting**: Separate Wave FO modules for faster initial load
- **Caching Strategy**: Service Worker for static assets (JS, CSS, icons)
- **Target Metrics**:
  - Initial load: < 2 seconds on 4G
  - Interactive: < 3 seconds
  - Offline-ready: All core features work without network

### 1.4 Mobile-Specific Components
- **Responsive Typography**: 
  - Header: 18px (mobile) → 20px (desktop)
  - Body: 14px (mobile) → 16px (desktop)
  - Buttons: 16px (mobile) → 14px (desktop)
- **Safe Area Insets**: Respect notches, bottom bars (iOS/Android)
- **Landscape Mode**: Support split-view on tablets

---

## PHASE 2: QuickBooks Integration (Week 1-2)

### 2.1 Architecture
**Backend Function**: `syncWaveFOToQuickBooks.js`
- Triggered on invoice generation or job closeout
- Syncs: Job costs, invoices, contractor payments
- Requires: QBO API credentials (user-provided OAuth or API token)

### 2.2 Data Mapping
```
Wave FO ScopeOfWork → QBO Invoice
- job_title → Description
- customer_name → Customer
- cost_amount → Line item total
- contractor_payout_amount → Expense (contractor payment)

Wave FO Payment → QBO Journal Entry
- contractor_payout_amount → Debit (Checking)
- platform_fee_amount → Credit (Fee Income)
```

### 2.3 Implementation Steps
1. Request QuickBooks API credentials via `set_secrets`
2. Write backend function with QBO SDK
3. Add sync button to invoice panel (Wave FO) or admin dashboard
4. Error logging and reconciliation reports

---

## PHASE 3: Sage Integration (Week 2-3)

### 3.1 Architecture
**Backend Function**: `syncWaveFOToSage.js`
- REST API integration with Sage Business Cloud
- Syncs: Invoices, purchase ledger, expense tracking

### 3.2 Data Mapping
```
Wave FO ScopeOfWork → Sage Sales Invoice
- job_title → Description
- customer_name → Contact
- cost_amount → Net amount
- contractor_payout_amount → Purchase order

Wave FO Contractor Profile → Sage Supplier
- contractor_name → Supplier name
- contractor_email → Contact email
```

### 3.3 Implementation Steps
1. Request Sage API credentials (OAuth setup required)
2. Build Sage SDK wrapper function
3. Batch sync (daily/weekly reconciliation)
4. Dashboard widget for sync status

---

## PHASE 4: HubSpot CRM Deep Integration (Week 3+)

### 4.1 Existing Foundation
✅ HubSpot is already an authorized app connector
- Contact syncing: Contractor & Customer profiles
- Deal creation: From proposal to job completion
- Timeline logging: Communication, status updates

### 4.2 Advanced Features to Unlock
1. **Automated Workflows**:
   - New job → Auto-create deal in HubSpot
   - Job completion → Update contact lifecycle stage
   - Payment processed → Log activity in CRM

2. **Two-Way Sync**:
   - Pull leads from HubSpot → Create Wave FO jobs
   - Sync job status → Update deal properties in HubSpot
   - Review/rating → Append to contact timeline

3. **Reporting Integration**:
   - HubSpot dashboard widgets for contractor performance
   - Wave FO revenue metrics → HubSpot analytics

### 4.3 Implementation
- Leverage existing `-build as needed` HubSpot connector
- Build entity automations (create/update triggers)
- Create backend functions for bi-directional sync

---

## PHASE 5: Marketing Platform Integrations (Week 4+)

### 5.1 Email Marketing (Klaviyo / Mailchimp)
- Auto-sync contractor contact list
- Trigger review request emails on job completion
- Campaign segmentation by contractor tier

### 5.2 SMS Marketing (Twilio)
- Job alert notifications for contractors
- Payment confirmations via SMS
- Review reminders to customers

### 5.3 Social Media Management (Buffer / Hootsuite)
- Auto-post contractor wins/testimonials (with permission)
- Content calendar integration for case studies

---

## PHASE 6: Mobile-First Feature Enhancements

### 6.1 Quick Actions
- Home screen shortcuts for Wave FO (iOS/Android)
- Push notifications for new jobs, messages, payments
- Biometric login (Face ID / Touch ID)

### 6.2 Advanced Offline Features
- Offline job detail viewing with cached photos
- Signature capture without network (save, sync on reconnect)
- Auto-submit when connection restored

### 6.3 Field Operations
- GPS-integrated job routing (recommend next job by location)
- Time tracking with offline support
- Voice notes (audio-to-text for field notes)

---

## Implementation Priority Matrix

| Phase | Component | Effort | Impact | Timeline |
|-------|-----------|--------|--------|----------|
| **1** | Mobile perf hardening | Medium | Critical | Now |
| **1** | Offline cache expansion | Medium | Critical | Now |
| **2** | QuickBooks sync | High | High | Week 1-2 |
| **3** | Sage sync | High | High | Week 2-3 |
| **4** | HubSpot advanced | High | Very High | Week 3+ |
| **5** | Email marketing | Medium | Medium | Week 4+ |
| **5** | SMS alerts | Low | High | Week 4+ |
| **6** | Push notifications | Medium | High | After Phase 1 |

---

## Success Metrics

### Mobile Performance
- [ ] Load time < 2s on 4G
- [ ] 95+ Lighthouse score
- [ ] Zero crashes on tested devices

### Integration Stability
- [ ] 99.9% sync success rate for accounting
- [ ] CRM data parity within 5 minutes
- [ ] Failed syncs logged and retried

### User Experience
- [ ] Field contractors report <2% friction issues
- [ ] Mobile abandonment rate < 5%
- [ ] NPS score > 8/10 for Wave FO

---

## Risk Mitigation

**Mobile Crashes**: Implement crash analytics (Sentry / Firebase)  
**Data Sync Conflicts**: Transaction IDs and idempotency keys  
**API Rate Limits**: Queue and batch processing  
**Offline Data Loss**: Local encryption + cloud backup strategy