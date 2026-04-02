# PRE-SUBMISSION CHECKLIST
**Run this before submitting ANY new page, component, or feature**

---

## RESPONSIVE DESIGN CHECKLIST

### Step 1: Mobile (375px) Testing
```
Before submission, test in Chrome DevTools:
1. Open DevTools (F12)
2. Click device toggle icon (tablet icon)
3. Click "Edit" → Set custom device: 375px × 667px
4. Reload page

☐ Text is readable without zooming
☐ No horizontal scrolling anywhere
☐ All buttons are at least 44px tall
☐ Form inputs are full width
☐ Navigation is accessible (hamburger menu or back button visible)
☐ Images scale properly
☐ Modals are full-width
☐ Padding is consistent (4px-6px sides minimum)
☐ All interactive elements can be tapped easily
```

### Step 2: Tablet (768px) Testing
```
Set custom device: 768px × 1024px

☐ Layout uses available space (not too cramped)
☐ Sidebars may appear or be hidden (intentional)
☐ Cards/grids start showing in 2+ columns (if applicable)
☐ No layout looks broken or weird
☐ Text still readable
☐ Nothing is squished
```

### Step 3: Desktop (1280px) Testing
```
Set custom device: 1280px × 800px

☐ Desktop sidebars are visible
☐ Desktop nav is visible
☐ Content uses full width (not squished to center)
☐ Grid layouts show proper columns (3+ if applicable)
☐ Hover states work on buttons/links
☐ Layout is clearly different from mobile (shows improvement)
```

---

## CODE PATTERN CHECKLIST

### Step 4: Check Responsive Classes
```
Open your code file and search for:

☐ Uses lg:hidden for mobile-only content
☐ Uses hidden lg:flex for desktop-only content
☐ NO sm: or md: prefixes (unless exception approved)
☐ Grid uses: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
☐ NOT: grid-cols-3 (hardcoded, will break on mobile)
☐ Flex uses: flex-col lg:flex-row (where applicable)
☐ Forms use: w-full (full width on mobile)
☐ Buttons use: py-3 (at least 44px height)
```

### Step 5: Check for Common Mistakes
```
Search in your code:

☐ NO inline styles with fixed widths: style={{ width: '500px' }}
☐ NO inline styles with fixed heights (except intentional)
☐ NO hardcoded Tailwind classes like: w-96, w-80, w-screen
☐ NO absolute positioning instead of flex
☐ NO position: fixed elements that cover content
☐ NO overflow-x: auto on body/main (horizontal scroll)
```

---

## WAVE FO SPECIFIC CHECKLIST

### Step 6: If this is a WAVE FO Feature
```
☐ Feature checks user.role === 'admin'
☐ Non-admin users see mobile-first message on desktop (lg:hidden alternative)
☐ Non-admin users see full feature on mobile
☐ Admin users see full feature on desktop
☐ Contractor tier is checked (completed_jobs_count >= 15/35/55)
☐ If access denied, shows FieldOpsAccessGate or similar gate
☐ Desktop sidebar is hidden for non-admins (if applicable)

Implementation check:
```jsx
const isAdmin = user?.role === 'admin';
const completedJobs = contractor?.completed_jobs_count || 0;
const hasAccess = isAdmin || completedJobs >= 15;

if (!hasAccess) {
  return <AccessGate />;
}

// For desktop-only features:
{isAdmin ? <FullFeature /> : <MobileFirstMessage />}
```
```

---

## COMPONENT STRUCTURE CHECKLIST

### Step 7: Code Structure Review
```
For new pages, verify:

☐ Has useEffect for auth check and data fetching
☐ Sets loading state during fetch
☐ Handles auth errors gracefully
☐ Returns loading spinner while loading
☐ Returns auth gate if not authenticated (if required)
☐ Uses semantic HTML (button, a, input, form)
☐ Has meaningful className organization
☐ Mobile-first CSS (defaults for mobile)
☐ Desktop enhancements with lg: prefix
```

---

## FINAL VERIFICATION

### Step 8: Self-Review Checklist
```
Before clicking "Submit":

☐ Tested at 375px - works perfectly
☐ Tested at 768px - looks intentional
☐ Tested at 1280px - uses full layout
☐ No horizontal scrolling at any size
☐ All buttons/inputs are 44px+ tall
☐ Forms are full-width on mobile
☐ Grids collapse to 1 column on mobile
☐ WAVE FO rules respected (if applicable)
☐ Code follows DEVELOPMENT_STANDARDS.md patterns
☐ No typos or console errors
☐ Component works in isolation
```

### Step 9: Final Questions
```
Ask yourself:

Q: Would a mobile user find this easy to use?
A: ☐ Yes ☐ No (if No, fix before submitting)

Q: Does desktop look noticeably better than mobile?
A: ☐ Yes ☐ No (if No, might not need desktop version)

Q: If this is WAVE FO, would a non-admin on desktop get it?
A: ☐ Yes, the message is clear ☐ No (if No, fix before submitting)

Q: Can I tap every button on a phone without zooming?
A: ☐ Yes ☐ No (if No, increase button size)

Q: Are there any confusing or broken layouts?
A: ☐ No ☐ Yes (if Yes, fix before submitting)
```

---

## QUICK FIX REFERENCE

### If you find issues during testing:

**Problem**: Text is cut off at 375px  
**Fix**: Remove width constraints, use `w-full` or `flex-1`

**Problem**: Buttons are too small to tap  
**Fix**: Change `py-2` to `py-3` or `py-4` (aim for 44px total)

**Problem**: Grid shows 3 columns on mobile  
**Fix**: Change `grid-cols-3` to `grid-cols-1 lg:grid-cols-3`

**Problem**: Sidebar covers content on mobile  
**Fix**: Add `hidden lg:block` to sidebar

**Problem**: Form input is too small  
**Fix**: Add `w-full` to input, change `p-2` to `p-3`

**Problem**: Horizontal scroll exists  
**Fix**: Remove fixed widths, check for `w-screen` or `overflow-x-auto`

**Problem**: Looks cramped on mobile  
**Fix**: Add `px-4 lg:px-8` for scaling padding

**Problem**: WAVE FO non-admin sees full desktop UI  
**Fix**: Wrap desktop UI in `{isAdmin ? <UI /> : <Message />}`

---

## SUBMISSION STATEMENT

Before clicking submit, copy and paste this and fill it out:

```
## Submission Checklist for [Page/Component Name]

**Mobile (375px)**: ☐ Tested and working
**Tablet (768px)**: ☐ Tested and working  
**Desktop (1280px)**: ☐ Tested and working

**Responsive Classes**: ☐ Uses lg:hidden/hidden lg:flex pattern
**No Hardcoded Widths**: ☐ All flexible sizing
**Form Inputs**: ☐ Full-width on mobile
**Touch Targets**: ☐ All 44px+ height
**No Horizontal Scroll**: ☐ Verified at all sizes

**WAVE FO Compliant**: ☐ N/A OR ☐ Admin/user rules respected
**Code Quality**: ☐ Follows DEVELOPMENT_STANDARDS.md
**No Console Errors**: ☐ Verified

**Ready for submission**: YES
```

---

## EXAMPLE: GOOD vs BAD

### ❌ BAD - Mobile Won't Work
```jsx
export default function MyPage() {
  return (
    <div className="flex">
      <div className="w-1/3">Sidebar</div>
      <div className="w-2/3">Content</div>
    </div>
  );
}
// Problem: Sidebar takes 1/3 on mobile (too cramped)
```

### ✅ GOOD - Mobile-First
```jsx
export default function MyPage() {
  return (
    <div className="flex flex-col lg:flex-row">
      <aside className="hidden lg:block lg:w-64">Sidebar</aside>
      <main className="flex-1">Content</main>
    </div>
  );
}
// Works: Full-width on mobile, sidebar appears on desktop
```

---

## REMEMBER

**This checklist is not optional.** Every submission must pass all items. If you skip testing, users will experience broken layouts.

**Time to complete this checklist**: 10-15 minutes per component

**Time to fix issues found**: Varies

**It's faster to test now than to fix bugs later.**