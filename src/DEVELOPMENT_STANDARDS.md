# DEVELOPMENT STANDARDS
**Responsive Design + WAVE FO Access Rules**

**All new pages, components, and features MUST follow these patterns.**

---

## 1. RESPONSIVE DESIGN RULES (Mobile-First)

### Breakpoint Strategy
```javascript
// ALWAYS use these Tailwind breakpoints:
// Mobile (default): 0px - 640px
// sm: 640px - 768px
// md: 768px - 1024px
// lg: 1024px - 1280px
// xl: 1280px+

// Standard pattern:
// <div className="block lg:hidden">Mobile only</div>
// <div className="hidden lg:block">Desktop only</div>
```

### Mobile-First Principle
- **Default CSS applies to mobile** (375px width)
- **Add `lg:` prefix for desktop enhancements** (1280px+ width)
- **Never use `sm:`, `md:` prefixes unless absolutely necessary**

### Required Elements for Every Page

#### 1. Mobile Navigation (on pages with nav)
```jsx
// ALWAYS include mobile back button or menu
<div className="lg:hidden flex items-center justify-between bg-slate-900 px-4 py-3">
  <Link to="/back" className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm">
    <ArrowLeft className="w-4 h-4" />
    Back
  </Link>
</div>
```

#### 2. Desktop Sidebar (if applicable)
```jsx
// Hide on mobile, show on desktop
<div className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-900">
  {/* Sidebar content */}
</div>
```

#### 3. Content Layout
```jsx
// Always use flex column on mobile, row on desktop
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="lg:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

#### 4. Forms & Inputs
```jsx
// Form inputs MUST be full-width on mobile, with proper touch targets
<input 
  type="text"
  className="w-full px-4 py-3 rounded-lg border border-slate-300"
  // At least 44px height for touch targets ✓
/>

// For form groups:
<div className="space-y-4">
  {/* Each input gets 44px+ height */}
</div>
```

#### 5. Grid Layouts
```jsx
// MUST collapse to 1 column on mobile
// Good pattern:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Bad pattern (DON'T USE):
<div className="grid grid-cols-3 gap-4">  {/* ❌ Never hardcode columns */}
```

#### 6. Modals & Dialogs
```jsx
// MUST be full-width on mobile
<div className="fixed inset-0 bg-white lg:bg-slate-900/50 lg:rounded-lg lg:w-96 lg:left-1/2 lg:transform lg:-translate-x-1/2">
  {/* Content */}
</div>
```

### Tap Target Minimum Size
- **All buttons & clickable elements: 44px height minimum**
- **Padding check**: `py-3` = 12px padding + text = typically 44px+
- **Small buttons acceptable only for: Secondary actions, decorative icons**

### Responsive Utilities Checklist
- [ ] Page uses flex layout (not absolute positioning)
- [ ] All text is readable without zooming (minimum 16px font)
- [ ] No hardcoded widths (use flex-1, w-full, etc.)
- [ ] All forms are full-width on mobile
- [ ] All grids collapse to 1 column on mobile
- [ ] Mobile navigation is accessible
- [ ] Desktop sidebar is hidden on mobile (lg:hidden)
- [ ] No horizontal scrolling
- [ ] Padding scales appropriately (px-4 mobile → px-8 desktop)

---

## 2. WAVE FO ACCESS RULES (Admin vs User)

### Rule Summary
| Feature | Mobile | Desktop |
|---------|--------|---------|
| Non-Admin User | Full access | **Mobile-first message only** |
| Admin User | Full access | **Full access** |
| Contractor Tier | 0-14 jobs | No WAVE FO access |
| Contractor Tier | 15-54 jobs | WAVE FO access |
| Contractor Tier | 55+ jobs | WAVE FO + SurfCoast WAVE FO |

### Implementation Pattern

#### For Any WAVE FO Page
```javascript
// 1. Get user and contractor data
const [user, setUser] = useState(null);
const [contractor, setContractor] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  const init = async () => {
    const me = await base44.auth.me();
    setUser(me);
    if (me?.role === 'admin') setIsAdmin(true);
    
    const contractors = await base44.entities.Contractor.filter({ 
      email: me.email 
    });
    if (contractors?.length > 0) setContractor(contractors[0]);
  };
  init();
}, []);

// 2. Check tier access
const completedJobs = contractor?.completed_jobs_count || 0;
const hasWaveFOAccess = isAdmin || completedJobs >= 15;

// 3. Redirect if no access
if (contractor && !hasWaveFOAccess) {
  return <FieldOpsAccessGate contractor={contractor} />;
}

// 4. Hide desktop sidebar for non-admins
return (
  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
    {isAdmin ? (
      <Sidebar />
    ) : (
      <div className="hidden lg:flex flex-col items-center justify-center bg-slate-900 w-64 border-r border-slate-800 p-6">
        <p className="text-white text-lg font-semibold">Wave FO Mobile-First</p>
        <p className="text-slate-400 text-sm">For full experience, use your mobile device.</p>
      </div>
    )}
    {/* Main content always shows on mobile */}
    <div className="flex-1 overflow-y-auto">
      {/* Content */}
    </div>
  </div>
);
```

#### For New WAVE FO Components
```jsx
// Check access before rendering
export default function WaveFOComponent({ isAdmin, contractor }) {
  const completedJobs = contractor?.completed_jobs_count || 0;
  
  // Only admins see desktop version of WAVE FO components
  if (!isAdmin) {
    return (
      <div className="hidden lg:block p-6 bg-slate-900 text-white text-center">
        <p>This feature is mobile-optimized</p>
      </div>
    );
  }
  
  return <DesktopVersion />;
}
```

### Contractor Tier Gates
```javascript
// For features requiring specific tiers:
const showAdvancedFeature = isAdmin || completedJobs >= 35; // Swell tier+
const showBreakerAccess = isAdmin || completedJobs >= 55;   // SurfCoast tier

if (!showAdvancedFeature) {
  return <UpgradePrompt tier="Swell" jobsNeeded={35} />;
}
```

---

## 3. PAGE STRUCTURE TEMPLATE

Use this template for all new pages:

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Mobile-first component structure
export default function NewPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me?.role === 'admin') setIsAdmin(true);
      } catch (e) {
        console.error('Auth error:', e);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    // Main container: flex column mobile, adapt for desktop
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* Mobile: Back button header (lg:hidden) */}
      <div className="lg:hidden flex items-center bg-slate-50 px-4 py-3 border-b border-slate-200">
        <Link to="/back" className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Desktop: Sidebar (hidden lg:flex) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-slate-50 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Navigation</h2>
        {/* Sidebar content */}
      </aside>

      {/* Main content: full width mobile, flex-1 desktop */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Desktop top bar (hidden lg:flex) */}
        <div className="hidden lg:flex items-center justify-between bg-white px-8 py-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Page Title</h1>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Page content here */}
        </div>
      </main>
    </div>
  );
}
```

---

## 4. COMPONENT CHECKLIST

Before submitting any new component, verify:

- [ ] **Mobile responsive**
  - [ ] Works at 375px width
  - [ ] Text readable without zoom
  - [ ] All buttons 44px+ height
  - [ ] No horizontal scroll

- [ ] **Tablet optimized**
  - [ ] Works at 768px width
  - [ ] Layout makes sense
  - [ ] Not identical to mobile

- [ ] **Desktop enhanced**
  - [ ] Works at 1280px+ width
  - [ ] Uses full width where appropriate
  - [ ] Sidebars/columns appear

- [ ] **WAVE FO aware**
  - [ ] If WAVE FO feature: respects admin/user rules
  - [ ] Desktop access restricted for non-admins (if applicable)
  - [ ] Mobile access unrestricted

- [ ] **Touch-friendly**
  - [ ] All interactive elements >= 44px
  - [ ] Spacing between buttons (gap-2+)
  - [ ] Form inputs clearly tappable

- [ ] **Accessibility**
  - [ ] Semantic HTML (buttons, links, etc.)
  - [ ] ARIA labels where needed
  - [ ] Keyboard navigation works

---

## 5. QUICK REFERENCE: COMMON PATTERNS

### Navigation Pattern
```jsx
// Mobile only menu
<div className="lg:hidden">
  <LayoutMobileMenu {...props} />
</div>

// Desktop only nav
<div className="hidden lg:flex gap-4">
  <NavLink>Item 1</NavLink>
  <NavLink>Item 2</NavLink>
</div>
```

### Grid Pattern
```jsx
// Cards that collapse properly
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Form Pattern
```jsx
// Full-width on mobile, constrained on desktop
<form className="max-w-2xl w-full mx-auto space-y-4 p-4 lg:p-0">
  <input type="text" className="w-full px-4 py-3 rounded-lg border" />
  <button className="w-full py-3 bg-blue-600 text-white rounded-lg lg:w-auto">
    Submit
  </button>
</form>
```

### Sidebar Pattern
```jsx
// Hide sidebar on mobile
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="hidden lg:block w-64">
    <Sidebar />
  </aside>
  <main className="flex-1">
    <Content />
  </main>
</div>
```

### WAVE FO Pattern
```jsx
// Admin sees full interface, users see mobile-first message on desktop
{isAdmin ? (
  <Sidebar />
) : (
  <div className="hidden lg:flex flex-col items-center justify-center w-64">
    <MobileFirstMessage />
  </div>
)}
```

---

## 6. TESTING REQUIREMENTS

Before marking any new page/component as complete:

1. **Test mobile (375px)**
   - Open DevTools → Responsive mode
   - Set width to 375px
   - Check no overflow, text readable, buttons tappable

2. **Test tablet (768px)**
   - Set width to 768px
   - Verify layout adapts sensibly

3. **Test desktop (1280px)**
   - Set width to 1280px
   - Verify full layout displays

4. **Test WAVE FO rules (if applicable)**
   - Login as non-admin → should see mobile-first restriction on desktop
   - Login as admin → should see full interface
   - Test on mobile → all users see full interface

---

## 7. REVIEW CHECKLIST FOR CODE REVIEWS

When reviewing new pages/components, check:

- [ ] Uses `lg:hidden` for mobile-only elements
- [ ] Uses `hidden lg:flex` for desktop-only elements
- [ ] No `sm:` or `md:` prefixes (unless exception approved)
- [ ] All grids use `grid-cols-1 md:grid-cols-X lg:grid-cols-Y` pattern
- [ ] Forms are full-width on mobile
- [ ] No hardcoded widths
- [ ] WAVE FO features respect admin/user rules
- [ ] Mobile nav accessible and clear
- [ ] No horizontal scroll at any breakpoint
- [ ] Tap targets are 44px minimum

---

## 8. EXCEPTIONS & APPROVALS

### When to deviate from these rules:
- **Mobile sidebar required for navigation** → Get explicit approval, ensure collapsible
- **Complex desktop layout** → Use `flex flex-col lg:flex-row` pattern
- **Data table with many columns** → Accept horizontal scroll on mobile if necessary (but try to avoid)
- **Admin-only feature** → Can be desktop-only if marked clearly

**All exceptions require documented approval before implementation.**

---

## SUMMARY

**For every new page/component, ask yourself:**
1. ✅ Does this look right at 375px (mobile)?
2. ✅ Does this work at 768px (tablet)?
3. ✅ Does this work at 1280px (desktop)?
4. ✅ If WAVE FO: Does this respect admin/user access rules?
5. ✅ Are all buttons/inputs 44px+ tall?
6. ✅ Is there any horizontal scroll?
7. ✅ Can someone on a phone tap everything easily?

**If you answer "no" to any of these, fix before submitting.**