import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StandardLayout — provides consistent page structure across the app
 * Ensures uniform spacing, typography, and layout patterns
 */
export function StandardPageLayout({ 
  title, 
  subtitle,
  children, 
  actions,
  className = '' 
}) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      {title && (
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
                {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

/**
 * StandardCard — consistent card styling for content blocks
 */
export function StandardCard({ children, className = '' }) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-lg shadow-sm p-6',
      className
    )}>
      {children}
    </div>
  );
}

/**
 * StandardGrid — consistent grid layout for lists
 */
export function StandardGrid({ children, columns = 3, gap = 6 }) {
  return (
    <div className={cn(
      `grid gap-${gap}`,
      `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`
    )}>
      {children}
    </div>
  );
}

/**
 * StandardForm — consistent form wrapper
 */
export function StandardForm({ children, onSubmit, title }) {
  return (
    <StandardCard>
      {title && <h2 className="text-xl font-semibold mb-6">{title}</h2>}
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </StandardCard>
  );
}

/**
 * StandardFormField — consistent form field styling
 */
export function StandardFormField({ label, error, children }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/**
 * StandardSection — consistent section grouping
 */
export function StandardSection({ title, children, className = '' }) {
  return (
    <div className={cn('space-y-4', className)}>
      {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
      {children}
    </div>
  );
}