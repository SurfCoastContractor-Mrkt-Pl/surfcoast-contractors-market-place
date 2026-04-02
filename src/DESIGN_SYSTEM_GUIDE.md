# SurfCoast Design System Guide

## Overview

This document describes the centralized design token system implemented for SurfCoast. All pages should use these tokens for consistent, maintainable styling.

---

## Quick Start

### Method 1: CSS Classes (Recommended for simple elements)

```jsx
// Buttons
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-outline">Outline Action</button>

// Cards
<div className="card-base">Card content</div>
<div className="card-elevated">Elevated card</div>
<div className="card-featured">Featured card</div>

// Text
<p className="text-heading">Heading Text</p>
<p className="text-body">Body Text</p>
<p className="text-muted">Muted Text</p>

// Messages
<div className="error-message">Error occurred</div>
<div className="success-message">Success!</div>
<div className="warning-message">Warning</div>

// Input
<input type="text" className="input-base" placeholder="Enter text..." />
```

### Method 2: Inline Styles (For styled-components or dynamic styling)

```jsx
import { applyDesignTokens } from '@/lib/designTokenProvider';

// Simple button
<button style={applyDesignTokens.inline.buttonPrimary}>Click me</button>

// Card
<div style={applyDesignTokens.inline.cardBase}>Content</div>

// Text
<p style={applyDesignTokens.inline.textHeading}>Heading</p>
```

### Method 3: Hook (For complex component logic)

```jsx
import { useDesignTokens } from '@/lib/designTokenProvider';

export function MyComponent() {
  const tokens = useDesignTokens();
  
  return (
    <div style={{ color: tokens.colors.accent }}>
      Colored text with token color
    </div>
  );
}
```

### Method 4: Class Builder (For conditional styles)

```jsx
import { classBuilder } from '@/lib/designTokenProvider';

<div className={classBuilder(['card-base', isHovered && 'shadow-lg'])}>
  Content
</div>
```

---

## Design Tokens Reference

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| accent | #ea580c | Primary brand orange - buttons, links, highlights |
| primary | #2176cc | Blue - secondary brand color |
| success | #16a34a | Green - positive feedback |
| error | #dc2626 | Red - errors, destructive actions |
| warning | #f59e0b | Amber - warnings |
| gray100 | #f9fafb | Lightest gray - backgrounds |
| gray200 | #f3f4f6 | Light gray - subtle backgrounds |
| gray300 | #e5e7eb | Gray - borders |
| gray600 | #4b5563 | Medium gray - secondary text |
| gray700 | #374151 | Dark gray - body text |
| gray900 | #111827 | Darkest gray - headings |
| white | #ffffff | White |

### Buttons

**Primary Button** (.btn-primary)
- Background: Orange (#ea580c)
- Text: White
- Padding: 12px 32px
- Border Radius: 8px
- Font Weight: 700
- Hover: Darker orange (#d94600)

**Secondary Button** (.btn-secondary)
- Background: Transparent
- Border: 2px solid blue (#2176cc)
- Text: Blue
- Padding: 12px 24px
- Hover: Light blue background

**Outline Button** (.btn-outline)
- Background: Transparent
- Border: 1px solid gray (#d1d5db)
- Text: Gray (#4b5563)
- Padding: 8px 16px
- Hover: Orange background with orange border

### Cards

**Base Card** (.card-base)
- Background: White
- Border: 1px solid light gray
- Border Radius: 12px
- Padding: 24px
- Hover: Subtle shadow

**Elevated Card** (.card-elevated)
- Background: Very light gray (#f9fafb)
- No border
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.08)

**Featured Card** (.card-featured)
- Background: Gradient (orange to light orange)
- Border: 2px solid orange
- Border Radius: 16px
- Padding: 32px

### Inputs

**Base Input** (.input-base)
- Background: White
- Border: 1px solid gray
- Border Radius: 8px
- Padding: 12px 16px
- Focus: Orange border + light orange shadow

### Text

- `.text-heading` - Dark gray, bold
- `.text-body` - Medium gray, standard weight
- `.text-muted` - Lighter gray, secondary text
- `.text-accent` - Orange, for highlights
- `.text-primary` - Blue, for primary text

### Messages

- `.error-message` - Light red background, dark red text
- `.success-message` - Light green background, dark green text
- `.warning-message` - Light amber background, dark amber text

### Spacing

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

### Shadow

- Small: `0 2px 8px rgba(0, 0, 0, 0.08)`
- Medium: `0 10px 25px rgba(0, 0, 0, 0.08)`
- Large: `0 20px 50px rgba(0, 0, 0, 0.12)`

---

## Migration Guide

### Updating Existing Pages

**Before:**
```jsx
<button style={{ background: '#ea580c', color: 'white', padding: '12px 32px' }}>
  Click me
</button>
```

**After:**
```jsx
<button className="btn-primary">Click me</button>
```

### Complex Updates with Tailwind

If using Tailwind classes, combine with design tokens:

```jsx
<div className="card-base hover:shadow-md transition-all">
  Content
</div>
```

---

## Best Practices

1. **Use CSS classes first** - They're cleaner and more maintainable
2. **Use inline styles for dynamic values** - When you need to calculate colors based on props
3. **Use hooks for complex logic** - When component needs multiple token values
4. **Don't hardcode colors** - Always use the token system
5. **Keep component design simple** - Reuse cards, buttons, inputs from this system

---

## File References

- **CSS Classes**: `src/index.css` (lines 174-297)
- **Token Utilities**: `src/lib/designTokenProvider.js`
- **Design Token Values**: `src/lib/designTokens.js` (original comprehensive tokens)

---

## Component Examples

### Simple Form

```jsx
<div className="card-base">
  <h2 className="text-heading">Sign Up</h2>
  <input type="email" className="input-base" placeholder="Email" />
  <button className="btn-primary">Submit</button>
  {error && <div className="error-message">{error}</div>}
</div>
```

### Trust Signals Section

```jsx
<div>
  <div className="trust-item">
    <CheckCircle />
    <span>Verified licenses only</span>
  </div>
  <div className="trust-item">
    <CheckCircle />
    <span>Secure payments via Stripe</span>
  </div>
</div>
```

### Featured Product Card

```jsx
<div className="card-featured">
  <h3 className="text-heading">Premium Plan</h3>
  <p className="text-body">Get all features for $99/month</p>
  <button className="btn-primary">Get Started</button>
</div>
```

---

## Support

For questions about the design system, refer to:
1. This guide (DESIGN_SYSTEM_GUIDE.md)
2. `lib/designTokens.js` for comprehensive token definitions
3. `lib/designTokenProvider.js` for utility functions
4. `index.css` for CSS class definitions