import React from 'react';
import { cn } from '@/lib/utils';

/**
 * BentoGrid Component
 * Modern card layout with responsive grid positioning
 * 
 * Usage:
 * <BentoGrid>
 *   <BentoCard title="Feature 1" description="Details" featured />
 *   <BentoCard title="Feature 2" description="Details" />
 * </BentoGrid>
 */

export function BentoGrid({ children, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[200px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  className,
  title,
  description,
  featured,
  icon: Icon,
  children,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary cursor-pointer",
        featured && "md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary",
        className
      )}
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="space-y-2">
          {Icon && (
            <Icon className="w-8 h-8 text-primary mb-2" />
          )}
          {title && (
            <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}