import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Play } from 'lucide-react';

export default function SavedSearches({ userEmail, userType, onLoadSearch }) {
  const queryClient = useQueryClient();

  const { data: searches } = useQuery({
    queryKey: ['saved-searches', userEmail],
    queryFn: () => base44.entities.SavedSearch.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedSearch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches', userEmail] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedSearch.update(id, { is_default: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches', userEmail] });
    },
  });

  if (!searches || searches.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500">
        <p className="text-sm">No saved searches yet. Create one to save your current filters.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900 text-sm">My Saved Searches</h3>
      {searches.map(search => (
        <div key={search.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-slate-900">{search.search_name}</h4>
              {search.is_default && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">Default</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{search.search_type} • {search.query || 'All'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onLoadSearch(search)}
              className="text-amber-600 hover:text-amber-700"
            >
              <Play className="w-4 h-4" />
            </Button>
            {!search.is_default && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDefaultMutation.mutate(search.id)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Star className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteMutation.mutate(search.id)}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}