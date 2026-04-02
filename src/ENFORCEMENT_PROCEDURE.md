# ENFORCEMENT PROCEDURE
**How Responsive + WAVE FO Standards are Enforced**

---

## WORKFLOW: NEW FEATURE REQUEST

### Phase 1: Request & Planning
**Who**: Developer or Product Manager  
**Action**: Request new page/component/feature  
**Standard**: Verbal request is OK

### Phase 2: AI Implementation
**Who**: Base44 AI  
**Action**: Build the feature
**Standard**: MUST follow DEVELOPMENT_STANDARDS.md automatically
**Verification**: AI references checklist in comments when implementing

**Typical AI behavior**:
```jsx
// ✓ Mobile-first: flex-col default, lg:flex-row for desktop
<div className="flex flex-col lg:flex-row">

// ✓ Hidden on mobile, visible on desktop
<aside className="hidden lg:block w-64">

// ✓ Tap targets 44px minimum
<button className="px-4 py-3">Submit</button>

// ✓ If WAVE FO, check admin/user rules
{isAdmin ? <FullUI /> : <MobileMessage />}
```

### Phase 3: User Testing (Desktop Only)
**Who**: User in live preview  
**Action**: Visual inspection at viewports
**Required Testing**:
- [ ] 375px (mobile) - Uses PRE_SUBMISSION_CHECKLIST
- [ ] 768px (tablet) - Uses PRE_SUBMISSION_CHECKLIST
- [ ] 1280px (desktop) - Uses PRE_SUBMISSION_CHECKLIST
- [ ] WAVE FO access rules (if applicable) - Uses PRE_SUBMISSION_CHECKLIST

**User reports back**: Issues found → specific page, viewport, description

### Phase 4: AI Iteration & Fixes
**Who**: Base44 AI  
**Action**: Apply fixes based on user feedback
**Standard**: Uses find_replace or code modifications to fix issues
**Reference**: Cites DEVELOPMENT_STANDARDS.md in comments

**Example fix**:
```
// Issue: Button too small on mobile (was py-2)
// Fix: Increased to py-3 to meet 44px minimum touch target
// Ref: DEVELOPMENT_STANDARDS.md Section 1, Tap Target Minimum Size
```

### Phase 5: Final Verification
**Who**: User  
**Action**: Re-test fixed pages at all viewports
**Pass Criteria**: All PRE_SUBMISSION_CHECKLIST items pass

### Phase 6: Deployment
**Status**: Feature ready for production
**Standards Enforced**: 100% of responsive + WAVE FO rules

---

## CODE REVIEW GATES

### Gate 1: AI Implementation (Self-Check)
**Before submitting code**, AI verifies:
- [ ] Follows mobile-first pattern (defaults mobile, lg: for desktop)
- [ ] Uses correct breakpoint prefixes (lg: only, no sm: or md:)
- [ ] All grids collapse properly
- [ ] All forms full-width on mobile
- [ ] WAVE FO rules implemented (if applicable)

**If any item fails**, AI rewrites code before showing to user.

### Gate 2: User Viewport Testing
**User must test** at 375px, 768px, 1280px using PRE_SUBMISSION_CHECKLIST.

**If any viewport fails**, returns to Phase 4 (Iteration).

### Gate 3: WAVE FO Verification
**If feature touches WAVE FO**, verify:
- [ ] Non-admin users see mobile-first restriction on desktop
- [ ] Admin users see full interface on desktop
- [ ] All users see full interface on mobile
- [ ] Tier requirements enforced (15/35/55 jobs)

**If any rule violated**, returns to Phase 4 (Iteration).

---

## WHAT HAPPENS IF STANDARDS ARE MISSED

### Scenario 1: AI Submits Code With responsive Issues
**Detection**: User tests and reports layout broken at 375px
**Action**: AI immediately fixes using find_replace
**Prevention Next Time**: AI double-checks mobile pattern

### Scenario 2: New Page Missing WAVE FO Rules
**Detection**: User tests and finds non-admin has full desktop access
**Action**: AI adds `{isAdmin ? <UI /> : <Message />}` wrapper
**Prevention Next Time**: AI includes WAVE FO check in all feature requests

### Scenario 3: Component With Hardcoded Grid
**Detection**: User reports 3 columns showing on mobile
**Action**: AI changes `grid-cols-3` to `grid-cols-1 lg:grid-cols-3`
**Prevention Next Time**: AI never uses hardcoded columns

### Scenario 4: Button Tap Targets Too Small
**Detection**: User reports can't tap button on mobile
**Action**: AI changes `py-2` to `py-3` or adds `w-full px-4 py-3`
**Prevention Next Time**: AI enforces 44px minimum on all buttons

---

## STANDARDS REFERENCE IN CODE

### How Standards Are Documented
Every new file should include comments like:

```javascript
// Mobile-first responsive design (DEVELOPMENT_STANDARDS.md Section 1)
// - Default layout is flex-col (mobile)
// - lg:flex-row adds desktop row layout
// - Desktop sidebar hidden with lg:hidden
```

### How WAVE FO Rules Are Documented
```javascript
// WAVE FO access control (DEVELOPMENT_STANDARDS.md Section 2)
// - Non-admin users see mobile-first message on desktop
// - All users see full feature on mobile
// - Admin users see full feature everywhere
// - Requires 15+ completed jobs for tier access
```

---

## AUTOMATED CHECKS (Future)

**If team grows**, consider implementing:

1. **ESLint Rule**: Flag hardcoded grid-cols without responsive prefixes
   ```javascript
   // Error: grid-cols-3 must include grid-cols-1 and breakpoint prefixes
   // Use: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
   ```

2. **Responsive Testing Bot**: Run Lighthouse at all viewports
   ```
   Mobile (375px): No horizontal scroll ✓
   Tablet (768px): Layout adapts ✓
   Desktop (1280px): Full features ✓
   ```

3. **WAVE FO Checker**: Verify isAdmin checks in all WAVE FO pages
   ```javascript
   // Check: All WAVE FO pages have:
   // - const isAdmin = user?.role === 'admin'
   // - Non-admin desktop restriction logic
   ```

4. **Touch Target Checker**: Flag buttons with py-2 or smaller
   ```javascript
   // Warning: Button has py-2 (32px height, below 44px minimum)
   // Change to: py-3 (36px), py-4 (40px), or add px padding
   ```

---

## APPROVAL PROCESS FOR EXCEPTIONS

**When standards CANNOT be followed:**

1. **Document the exception** in a comment:
   ```javascript
   // Exception: This table requires horizontal scroll due to 15+ columns
   // Approval: User approved on [date] for [reason]
   // Reference: DEVELOPMENT_STANDARDS.md Section 8
   ```

2. **Get explicit user approval** before implementation:
   - User: "This needs horizontal scroll on mobile, that's OK"
   - AI: "Documented exception, proceeding"

3. **Add clear messaging** to users:
   ```jsx
   <div className="lg:hidden bg-amber-50 p-3 text-sm text-amber-700">
     💡 Tip: Scroll horizontally to see all columns on mobile
   </div>
   ```

4. **Re-test thoroughly** with exception in place

---

## SUMMARY OF ENFORCEMENT

| Level | Enforcer | Check | Frequency |
|-------|----------|-------|-----------|
| 1. Code | AI | Mobile-first patterns, breakpoints | Every submission |
| 2. Visual | User | 375px, 768px, 1280px testing | Every submission |
| 3. WAVE FO | User | Admin/user access rules | Every WAVE FO feature |
| 4. Review | Both | DEVELOPMENT_STANDARDS checklist | Every submission |
| 5. Exception | User | Explicit approval required | As needed |

---

## QUICK REFERENCE FOR AI

**When implementing new features:**

1. ✅ Use `lg:hidden` for mobile-only content
2. ✅ Use `hidden lg:flex` for desktop-only content
3. ✅ Use `flex-col lg:flex-row` for flexible layouts
4. ✅ Use `grid-cols-1 lg:grid-cols-3` for grids
5. ✅ Use `w-full` for mobile-width elements
6. ✅ Use `py-3` minimum for buttons (44px tall)
7. ✅ Use `px-4` minimum for padding on mobile
8. ✅ Check `isAdmin` for WAVE FO features
9. ✅ Hide desktop UI for non-admins on desktop
10. ✅ Show mobile message when access denied

**When NOT to do:**
1. ❌ Don't use `sm:` or `md:` prefixes
2. ❌ Don't hardcode widths (w-96, w-80, etc.)
3. ❌ Don't use fixed heights unless intentional
4. ❌ Don't hide content on mobile (makes apps unusable)
5. ❌ Don't skip WAVE FO checks
6. ❌ Don't create buttons smaller than py-3
7. ❌ Don't create 1px paddings
8. ❌ Don't assume desktop is the default
9. ❌ Don't forget to test at all viewports
10. ❌ Don't submit without PRE_SUBMISSION_CHECKLIST

---

## CONCLUSION

**These standards are not suggestions.** Every new page, component, or feature:

✅ **WILL** follow mobile-first responsive design  
✅ **WILL** work at 375px, 768px, and 1280px  
✅ **WILL** have 44px+ touch targets  
✅ **WILL** respect WAVE FO admin/user access rules  
✅ **WILL** be tested before submission  

**When in doubt, refer back to:**
- `DEVELOPMENT_STANDARDS.md` - The rules
- `PRE_SUBMISSION_CHECKLIST.md` - The tests
- `ENFORCEMENT_PROCEDURE.md` - This document