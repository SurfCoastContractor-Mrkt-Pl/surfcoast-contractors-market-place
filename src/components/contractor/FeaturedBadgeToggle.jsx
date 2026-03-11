import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Star } from 'lucide-react';

export default function FeaturedBadgeToggle({ contractor }) {
  const [isFeatured, setIsFeatured] = useState(contractor?.is_featured || false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (featured) => {
      await base44.entities.Contractor.update(contractor.id, {
        is_featured: featured,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
    },
  });

  const handleToggle = (checked) => {
    setIsFeatured(checked);
    mutation.mutate(checked);
  };

  return (
    <Card className={`p-6 ${isFeatured ? 'bg-amber-50 border-amber-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">Featured Contractor</h3>
            {isFeatured && (
              <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-3">
            {isFeatured
              ? 'Your profile appears at the top of contractor searches and in featured listings.'
              : 'Feature your profile to get more visibility and attract more customers.'}
          </p>
          {isFeatured && (
            <p className="text-xs text-amber-700 font-medium">✓ Your profile is now promoted in searches</p>
          )}
        </div>
        <Switch
          checked={isFeatured}
          onCheckedChange={handleToggle}
          disabled={mutation.isPending}
          className="ml-4 shrink-0"
        />
      </div>
    </Card>
  );
}