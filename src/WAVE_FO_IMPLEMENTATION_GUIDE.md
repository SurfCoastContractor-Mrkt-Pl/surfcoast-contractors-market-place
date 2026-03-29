# Wave FO: Mobile Optimization & Integration Implementation Guide

**Status:** Foundation Complete ✅  
**Date:** March 29, 2026  
**Next Steps:** Begin Phase 1 Mobile Hardening

---

## What Was Created

### 1. **Strategic Roadmap** (`WAVE_FO_MOBILE_INTEGRATION_ROADMAP.md`)
A comprehensive 6-phase plan covering:
- Mobile performance hardening (now)
- QuickBooks integration (Week 1-2)
- Sage integration (Week 2-3)
- HubSpot advanced features (Week 3+)
- Marketing platform integrations (Week 4+)
- Mobile-first feature enhancements

### 2. **Backend Integration Manager** (`functions/waveFOIntegrationManager.js`)
Central hub routing requests to:
- `syncQuickBooks()` — Invoice and payment syncing
- `syncSage()` — Accounting data synchronization
- `syncHubSpot()` — CRM deal and contact updates
- `testConnection()` — Verify platform connectivity
- `getIntegrationStatus()` — Monitor sync health

**Key Feature:** Uses HubSpot connector (already authorized) as proof-of-concept for others.

### 3. **Integration UI Panel** (`components/fieldops/WaveFOIntegrationPanel.jsx`)
Mobile-friendly dashboard showing:
- Connection status for each platform
- Setup links for disconnected integrations
- Real-time sync controls with retry logic
- Network quality awareness
- Expandable detail cards for mobile

### 4. **Mobile Optimization Hooks** (`hooks/useMobileOptimization.js`)
Reusable utilities:
- `useMobileOptimization()` — Network detection, retry queue, device detection
- `useLazyImage()` — Lazy-load images for slow networks
- `useTouchGestures()` — Long-press and swipe support
- `useLocalCache()` — Persistent offline storage with TTL

---

## How to Use These Components

### **Quick Start: Add Integration Panel to Wave FO Admin**

Edit `pages/FieldOps.jsx` to include the integration panel in a new admin section:

```jsx
import WaveFOIntegrationPanel from '@/components/fieldops/WaveFOIntegrationPanel';

// In your admin dashboard or settings tab:
{activeTab === 'integrations' && (
  <WaveFOIntegrationPanel 
    scopeId={selectedScope?.id}
    onIntegrationSync={(platform, result) => {
      console.log(`${platform} synced:`, result);
      // Refresh UI or show success toast
    }}
  />
)}
```

### **Add Mobile Optimization to Any Component**

```jsx
import { useMobileOptimization, useLazyImage } from '@/hooks/useMobileOptimization';

function MyComponent() {
  const { isOnline, networkQuality, isMobile } = useMobileOptimization();
  const { imageSrc, isLoading, ref } = useLazyImage(imageUrl);

  return (
    <div>
      {!isOnline && <div>⚠️ Offline — changes will sync when reconnected</div>}
      {networkQuality === '3g' && <div>📶 Slow network detected</div>}
      <img ref={ref} src={imageSrc} alt="" />
    </div>
  );
}
```

---

## Integration Setup Instructions

### **Phase 1: Mobile Hardening (Now)**

1. **Review Wave FO Mobile Components:**
   - Audit button sizes (target: 44x44px minimum)
   - Check input padding (16px minimum font size on iOS)
   - Test scroll performance with large job lists

2. **Extend Offline Cache:**
   - Update `FieldJobsList.jsx` to cache job data with `useLocalCache()`
   - Add retry queue for failed photo uploads
   - Persist filter state for seamless UX on reconnect

3. **Add Network Status Indicator:**
   - Include online/offline dot in header (already exists)
   - Show network quality warning on slow connections

### **Phase 2: QuickBooks Integration (Week 1-2)**

1. **Request Secrets:**
   ```bash
   User must provide QuickBooks API credentials
   set_secrets({
     secretName: "QB_OAUTH_TOKEN",
     description: "QuickBooks OAuth access token"
   })
   ```

2. **Implement QB Sync:**
   - Expand `waveFOIntegrationManager.js` `syncQuickBooks()` function
   - Add QB SDK: `npm install intuit-oauth`
   - Map ScopeOfWork → QBO Invoice entity
   - Handle authentication flow

3. **Test & Monitor:**
   - Use `testConnection('quickbooks')` to verify
   - Monitor sync errors in admin dashboard

### **Phase 3: Sage Integration (Week 2-3)**

Follow same pattern as QuickBooks:
1. Request Sage API credentials
2. Implement REST API client in `syncSage()` function
3. Add error handling and retry logic
4. Test with sample data

### **Phase 4: HubSpot Advanced Features (Week 3+)**

Leverage existing HubSpot connector (`-build as needed`):
1. Create entity automations:
   - Trigger on `ScopeOfWork.create` → Create HubSpot deal
   - Trigger on `ScopeOfWork.update` → Update deal stage
   - Trigger on `Review.create` → Log activity to contact

2. Implement two-way sync:
   - Pull HubSpot deals → Create Wave FO job proposals
   - Sync job completion → Update contact lifecycle stage

3. Build reporting integration:
   - HubSpot dashboard widgets for contractor metrics
   - Wave FO revenue data in CRM analytics

---

## Performance Optimization Checklist

- [ ] **Images**: Implement lazy loading with `useLazyImage()` hook
- [ ] **Network**: Add retry queue with `useMobileOptimization()`
- [ ] **Offline**: Extend cache coverage with `useLocalCache()`
- [ ] **Touch**: Add gesture support with `useTouchGestures()`
- [ ] **Fonts**: Ensure 16px+ on inputs (prevent iOS zoom)
- [ ] **Buttons**: All interactive elements 44x44px minimum
- [ ] **Scroll**: Test job list virtualization on low-end devices
- [ ] **Bundle**: Split Wave FO code (lazy-load tabs)

---

## Testing Plan

### **Mobile Devices**
- iPhone 12/14 (iOS)
- Pixel 6/7 (Android)
- iPad (tablet view)
- iPhone SE (small screen)

### **Network Conditions**
- 4G: Baseline
- 3G: Test slow image loading, timeout handling
- 2G: Verify offline functionality
- Offline: Test cache persistence, retry queue

### **Performance Targets**
- Initial load: < 2 seconds on 4G
- Interactive: < 3 seconds
- Lighthouse: 95+ score
- Zero crashes on tested devices

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Mobile load time | < 2s | TBD |
| Lighthouse score | 95+ | TBD |
| Field contractor friction | < 2% | TBD |
| Integration sync success | 99.9% | N/A (pending implementation) |
| HubSpot data parity | < 5 min | N/A (pending implementation) |

---

## File Summary

| File | Purpose | Status |
|------|---------|--------|
| `WAVE_FO_MOBILE_INTEGRATION_ROADMAP.md` | Strategic planning | ✅ Complete |
| `WAVE_FO_IMPLEMENTATION_GUIDE.md` | This document | ✅ Complete |
| `functions/waveFOIntegrationManager.js` | Backend routing | ✅ Created |
| `components/fieldops/WaveFOIntegrationPanel.jsx` | Integration UI | ✅ Created |
| `hooks/useMobileOptimization.js` | Mobile utilities | ✅ Created |

---

## Next Immediate Actions

1. **Review & Integrate Hooks:**
   - Add `useMobileOptimization` to `FieldJobsList.jsx`
   - Add `useLazyImage` for after photos in `FieldJobDetail.jsx`

2. **Add Integration Panel:**
   - Route to `WaveFOIntegrationPanel` from Wave FO settings
   - Add to App.jsx if creating dedicated integration page

3. **Test Connection:**
   - Run `testConnection('hubspot')` to verify existing connector works
   - Use as model for QB/Sage implementation

4. **Mobile Testing:**
   - Test FieldJobsList on actual mobile device
   - Verify button sizes, touch responsiveness
   - Check offline mode with cache

5. **Plan QB Setup:**
   - Document QB OAuth flow for user onboarding
   - Prepare API credentials request process

---

## Support Resources

- **QuickBooks API:** https://developer.intuit.com/
- **Sage API:** https://developer.sage.com/
- **HubSpot API:** https://developers.hubspot.com/
- **Mobile Web Standards:** https://web.dev/mobile/
- **Deno Deploy Docs:** https://docs.deno.com/deploy/

---

**Questions?** Refer back to `WAVE_FO_MOBILE_INTEGRATION_ROADMAP.md` for detailed architecture and Phase-by-Phase breakdown.