import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

export default function FeaturedListingBadge({ size = 'default' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge className={`${sizeClasses[size]} bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold flex items-center gap-1`}>
      <Star className="w-4 h-4 fill-current" />
      Featured
    </Badge>
  );
}