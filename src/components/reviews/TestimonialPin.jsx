import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Pin, X } from 'lucide-react';

export default function TestimonialPin({ reviewId, isPinned = false, contractorId }) {
  const [pinned, setPinned] = useState(isPinned);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newPinnedState) => {
      await base44.entities.Review.update(reviewId, {
        is_pinned: newPinnedState,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-reviews', contractorId] });
    },
  });

  const handleToggle = () => {
    const newState = !pinned;
    setPinned(newState);
    mutation.mutate(newState);
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleToggle}
      disabled={mutation.isPending}
      className={`gap-1 ${pinned ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-slate-600'}`}
      title={pinned ? 'Unpin review' : 'Pin review to top'}
    >
      {pinned ? (
        <>
          <X className="w-4 h-4" />
          <span className="text-xs">Pinned</span>
        </>
      ) : (
        <>
          <Pin className="w-4 h-4" />
          <span className="text-xs">Pin</span>
        </>
      )}
    </Button>
  );
}