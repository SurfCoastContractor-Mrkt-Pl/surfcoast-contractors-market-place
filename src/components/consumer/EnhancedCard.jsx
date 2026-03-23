import React from 'react';
import { cn } from '@/lib/utils';

export default function EnhancedCard({ 
  children, 
  className,
  interactive = false,
  ...props 
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-amber-200/40 bg-gradient-to-br from-white/95 to-amber-50/60',
        'shadow-sm hover:shadow-md transition-all duration-200',
        interactive && 'cursor-pointer hover:border-amber-300/60 group',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}