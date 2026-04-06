# SurfCoast Design System

## Overview
This document defines the unified design system for the SurfCoast app. All pages and components should use these tokens and patterns for consistency.

## Color Palette

### Core Colors
- **Deep Slate** (`#555556`) — Primary background
- **Safety Orange** (`#FF8C00`) — Primary actions, CTAs, and accents
- **Electric Cobalt** (`#2E5BFF`) — Secondary actions and highlights
- **Gunmetal Steel** (`#404040`) — Accent borders
- **Titanium White** (`#FFFFFF`) — Text on dark backgrounds

### Semantic Colors (Use these in Tailwind)
```jsx
className="bg-background text-foreground"
className="bg-card text-card-foreground"
className="bg-primary text-primary-foreground"  // Orange
className="bg-secondary text-secondary-foreground"  // Cobalt
className="border border-border"
```

## Typography

### Font Families
- **Headings (Serif):** Playfair Display (serif) or Lora (serif)
- **Body (Sans):** Inter (sans-serif)
- **Labels (Mono):** Monospace, bold, italic

### Examples
```jsx
// Heading
<h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 800 }}>
  Title
</h1>

// Body text
<p className="text-foreground">Body text</p>

// Label/Badge
<span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '11px' }}>
  LABEL_TEXT
</span>
```

## Spacing
- `xs` = 4px
- `sm` = 8px
- `md` = 16px
- `lg` = 24px
- `xl` = 32px
- `xxl` = 48px

## Shadows
- **Card Shadow:** `3px 3px 0px #5C3500`
- **Glow (hover):** `0 0 18px 4px rgba(255, 180, 0, 0.35)`
- **Small Glow:** `0 0 14px 3px rgba(255, 180, 0, 0.3)`

## Border Radius
- `sm` = 4px
- `md` = 8px
- `lg` = 12px
- `xl` = 16px
- `full` = 9999px

## Component Patterns

### Card Component
```jsx
import { Colors, Shadows, BorderRadius } from '@/lib/designSystem';

const cardStyle = {
  background: Colors.card,
  border: `0.5px solid ${Colors.border}`,
  borderRadius: BorderRadius.lg,
  boxShadow: Shadows.card,
  transition: 'box-shadow 0.2s ease',
};
```

### Button Component
```jsx
<button style={{
  background: Colors.safetyOrange,
  color: Colors.titaniumWhite,
  padding: '12px 32px',
  borderRadius: BorderRadius.md,
  border: 'none',
  fontWeight: 700,
  cursor: 'pointer',
}}>
  Click me
</button>
```

### Section Headers
```jsx
<div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', letterSpacing: '0.06em', marginBottom: '12px' }}>
  // SECTION_NAME
</div>
<h2 style={{ fontSize: '26px', fontWeight: 800, color: Colors.deepSlate }}>
  Section Title
</h2>
```

## Best Practices

1. **Use Tailwind classes first** for layout, spacing, and responsive design
2. **Use design tokens** for colors and shadows to ensure consistency
3. **Avoid hardcoded colors** — always reference Colors, Shadows, or Tailwind variables
4. **Responsive design** — Use Tailwind's breakpoints (`sm:`, `lg:`, etc.)
5. **Hover states** — Include smooth transitions (0.2s ease)
6. **Accessibility** — Maintain sufficient color contrast (WCAG AA minimum)

## Tailwind Configuration

All tokens are mapped in `tailwind.config.js`:
```js
colors: {
  background: 'hsl(var(--background))',
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  // ... etc
}
```

## CSS Variables (index.css)

All colors are defined as CSS custom properties in `:root`:
```css
--deep-slate: #555556;
--safety-orange: #FF8C00;
--electric-cobalt: #2E5BFF;
```

## Updating the Design System

If you need to add or change colors:
1. Update `index.css` (`:root` section)
2. Update `tailwind.config.js` (if needed)
3. Update `lib/designSystem.js` (export new tokens)
4. Document the change here