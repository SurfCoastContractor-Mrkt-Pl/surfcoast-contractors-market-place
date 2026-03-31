# UI/UX Consistency & Refactoring Guide

## Design System Rules

### Typography
- **Page Title (h1)**: `text-3xl sm:text-4xl font-bold` + `border-b border-border bg-card py-8`
- **Section Title (h2)**: `text-xl font-semibold`
- **Subsection (h3)**: `text-lg font-semibold`
- **Body**: `text-sm sm:text-base text-foreground`
- **Muted Text**: `text-muted-foreground`

### Spacing
- **Page padding**: `px-4 sm:px-6 lg:px-8 py-8`
- **Max width**: `max-w-7xl mx-auto`
- **Section gap**: `space-y-6` or `gap-6`
- **Element gap**: `space-y-4` or `gap-4`

### Colors
- **Primary actions**: `bg-primary text-primary-foreground`
- **Secondary actions**: `bg-secondary text-secondary-foreground` or `variant="outline"`
- **Destructive**: `bg-destructive text-destructive-foreground`
- **Cards**: `bg-card border border-border`
- **Backgrounds**: `bg-background` or `bg-muted`

### Components to Use
✅ Use `StandardPageLayout` for page structure  
✅ Use `StandardCard` for content blocks  
✅ Use `StandardForm` for forms  
✅ Use shadcn/ui components (Button, Input, Select, etc.)  
✅ Use `ErrorAlert` for errors  
❌ Don't use custom styled divs  
❌ Don't use inline styles (use Tailwind)  
❌ Don't create duplicate card styles  

## Component Refactoring Checklist

### Every Page Should Have:
- [ ] Consistent header with title + optional subtitle
- [ ] Max width container (7xl)
- [ ] Proper padding/spacing
- [ ] Error boundary
- [ ] Loading state handling
- [ ] Empty state message
- [ ] Consistent button styling
- [ ] Mobile responsiveness

### Example Refactored Page
```jsx
import { StandardPageLayout, StandardCard } from '@/components/ui/StandardLayout';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function MyPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <StandardPageLayout 
      title="Page Title"
      subtitle="Brief description"
      actions={<Button onClick={handleCreate}>Create New</Button>}
    >
      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}
      
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <StandardCard>
          {/* Content */}
        </StandardCard>
      )}
    </StandardPageLayout>
  );
}
```

## Common UI Patterns

### Form Pattern
```jsx
import { StandardForm, StandardFormField } from '@/components/ui/StandardLayout';
import { Input } from '@/components/ui/input';

<StandardForm title="Contact Form" onSubmit={handleSubmit}>
  <StandardFormField label="Email" error={errors.email}>
    <Input {...register('email')} />
  </StandardFormField>
  <StandardFormField label="Message" error={errors.message}>
    <textarea {...register('message')} className="w-full border border-border rounded p-2" />
  </StandardFormField>
  <Button type="submit">Send</Button>
</StandardForm>
```

### Card Grid Pattern
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <StandardCard key={item.id}>
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-sm text-muted-foreground">{item.description}</p>
    </StandardCard>
  ))}
</div>
```

### Table Pattern
```jsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead className="border-b border-border bg-muted">
      <tr>
        <th className="text-left p-3 font-semibold">Name</th>
        <th className="text-left p-3 font-semibold">Email</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id} className="border-b border-border">
          <td className="p-3">{item.name}</td>
          <td className="p-3">{item.email}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

## Pages to Refactor (Priority Order)

### Critical (High Impact)
1. `pages/ContractorAccount` — large, inconsistent layout
2. `pages/Home` — landing page, many one-off styles
3. `pages/ProjectManagement` — complex layout

### High
4. `pages/ContractorBusinessHub` — dashboard layout
5. `pages/MarketShopDashboard` — duplicate pattern
6. `pages/ContractorFinancialDashboard` — multiple sections

### Medium
7. All admin pages — consistency in controls
8. All customer profile pages — standardized fields
9. Form pages — standardized input handling

## Accessibility Standards

- [ ] All interactive elements have proper labels
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Keyboard navigation works
- [ ] Error messages are descriptive
- [ ] Loading states are announced
- [ ] Images have alt text

## Mobile Responsiveness Checklist

- [ ] Single column layout on mobile
- [ ] Touch targets minimum 44px
- [ ] Font size at least 16px
- [ ] Proper viewport meta tag
- [ ] No horizontal scrolling
- [ ] Buttons are stacked on small screens