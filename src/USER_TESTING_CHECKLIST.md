# USER TESTING CHECKLIST
**What to test in the live preview after this implementation**

---

## WAVE FO ACCESS RULES (Test First - 5 minutes)

### Test 1: Non-Admin User on Desktop
1. **Prerequisites**: Have a non-admin contractor account (< 55 completed jobs)
2. **Action**: Navigate to `/WaveFo` on desktop (1280px)
3. **Expected Result**:
   - Desktop sidebar should show message: "Wave FO Mobile-First"
   - Message should say "Wave FO is optimized for mobile devices"
   - Should NOT see full WaveFOSidebar with job list, schedule, invoices, etc.
4. **Pass/Fail**: ___

### Test 2: Non-Admin User on Mobile
1. **Action**: Same user, navigate to `/WaveFo` on mobile (375px)
2. **Expected Result**:
   - Should see full Wave FO interface with all tabs
   - Should see WaveFOMobileNav at bottom
   - Should be able to interact with all features
3. **Pass/Fail**: ___

### Test 3: Admin User on Desktop
1. **Prerequisites**: Login as admin
2. **Action**: Navigate to `/WaveFo` on desktop (1280px)
3. **Expected Result**:
   - Should see FULL WaveFOSidebar with all navigation
   - Should see "🔧 ADMIN TEST MODE" banner at top
   - Should have access to all tabs (jobs, map, schedule, invoices, reports, profile, supplies, breaker)
4. **Pass/Fail**: ___

### Test 4: Admin User on Mobile
1. **Action**: Same admin, navigate to `/WaveFo` on mobile (375px)
2. **Expected Result**:
   - Should see WaveFOMobileNav with all tabs
   - Should have access to all features
3. **Pass/Fail**: ___

---

## HIGH-PRIORITY PAGE RESPONSIVE TESTS (30 minutes each)

### Home Page (`/`)
**Test at**: 375px, 768px, 1280px

- [ ] 375px - Hero section: Text readable, buttons stacked vertically
- [ ] 375px - Manifesto block: Text not cut off, proper padding
- [ ] 375px - Two-path split section: Cards stack in single column
- [ ] 375px - No horizontal scroll anywhere
- [ ] 768px - Tablet layout looks intentional (columns starting to appear)
- [ ] 1280px - Desktop layout uses full width, content not squished to center
- [ ] All text is readable without zooming
- [ ] All buttons are tappable (44px+ height)

**Issues Found**: ___
**Fixes Needed**: ___

---

### Pricing Page (`/pricing`)
**Test at**: 375px, 768px, 1280px

- [ ] 375px - Price cards stack in single column
- [ ] 375px - All text readable, prices visible
- [ ] 375px - No horizontal scroll
- [ ] 768px - Cards might show 2 columns (acceptable)
- [ ] 1280px - Cards in grid, proper spacing
- [ ] FAQ section readable on all sizes
- [ ] CTA buttons are tappable

**Issues Found**: ___
**Fixes Needed**: ___

---

### BecomeContractor (`/BecomeContractor`)
**Test at**: 375px, 768px, 1280px

- [ ] 375px - Form inputs full width, at least 44px height
- [ ] 375px - Progress indicator visible and helpful
- [ ] 375px - Buttons full width or close to it
- [ ] 375px - No keyboard covering form fields
- [ ] 768px - Form still usable
- [ ] 1280px - Form properly laid out with spacing

**Issues Found**: ___
**Fixes Needed**: ___

---

### FindContractors (`/FindContractors`)
**Test at**: 375px, 768px, 1280px

- [ ] 375px - Contractor cards stack in single column
- [ ] 375px - Filter inputs usable (not too small)
- [ ] 375px - No horizontal scroll
- [ ] 768px - Cards might show 2 columns
- [ ] 1280px - Cards in 3-column grid
- [ ] Distance badges visible on all sizes
- [ ] Search/filter controls accessible

**Issues Found**: ___
**Fixes Needed**: ___

---

### Jobs (`/Jobs`)
**Test at**: 375px, 768px, 1280px

- [ ] 375px - Job cards stack vertically
- [ ] 375px - Location selector not cramped
- [ ] 375px - Filter button accessible
- [ ] 768px - Cards might show 2 columns
- [ ] 1280px - Cards in 2-column grid
- [ ] Distance badges readable

**Issues Found**: ___
**Fixes Needed**: ___

---

### Messaging (`/Messaging`)
**Test at**: 375px, 768px, 1280px

- [ ] 375px - Chat interface usable
- [ ] 375px - Message input at bottom is accessible
- [ ] 768px - Sidebar and chat visible together
- [ ] 1280px - Full layout with sidebars

**Issues Found**: ___
**Fixes Needed**: ___

---

### Dashboard (`/Dashboard`)
**Test at**: 375px, 768px, 1280px

- [ ] 375px - Content readable, no overflow
- [ ] 768px - Layout makes sense
- [ ] 1280px - Uses available width

**Issues Found**: ___
**Fixes Needed**: ___

---

## COMMON ISSUES TO WATCH FOR

### Mobile (375px)
- [ ] Text overflowing container edges
- [ ] Buttons or links too small to tap (< 44px)
- [ ] Horizontal scrolling that shouldn't exist
- [ ] Images too large/not scaled
- [ ] Forms with inputs not full width
- [ ] Modals not full width
- [ ] Navigation overlapping content
- [ ] Padding too small at edges

### Tablet (768px)
- [ ] Desktop layout appearing (sidebar showing when shouldn't)
- [ ] Cards not using space efficiently
- [ ] Layouts too cramped or too spread out
- [ ] Grid columns not adjusting properly

### Desktop (1280px)
- [ ] Content squished to narrow center column (not using full width)
- [ ] Mobile layout still showing (sidebar hidden, menus collapsed)
- [ ] Grid layouts not expanding properly
- [ ] Hover states not working

---

## QUICK REFERENCE: VIEWPORT SIZES

Use Chrome DevTools:
1. Open DevTools (F12)
2. Click device toggle (tablet icon)
3. Choose "Responsive"
4. Set width to:
   - **375px** for mobile
   - **768px** for tablet
   - **1280px** for desktop

---

## REPORT TEMPLATE

For each issue found, note:

**Page**: [Name and URL]  
**Viewport**: [375px / 768px / 1280px]  
**Issue**: [Description of what's broken]  
**Expected**: [What should happen]  
**Screenshot**: [If possible, capture and describe]  

---

## NEXT STEPS AFTER TESTING

1. Complete all tests above
2. Document all "Issues Found"
3. Send list of issues back to AI with specific pages/viewports
4. AI will fix each issue systematically
5. Re-test fixed pages

---

## ESTIMATED TIME

- WAVE FO tests: 5 minutes
- Each page test: 5-10 minutes
- Total for 7 high-priority pages: 45-60 minutes
- Plus additional pages as needed

**Start with WAVE FO tests first** - they're quick and verify the admin/user logic is working.