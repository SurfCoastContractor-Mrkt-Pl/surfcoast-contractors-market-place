import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Pin, MessageSquare, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewManagementPanel({ contractorId, contractorEmail }) {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['contractorReviews', contractorId],
    queryFn: () => base44.entities.Review.filter({ contractor_id: contractorId }, '-created_at'),
    enabled: !!contractorId
  });

  const pinMutation = useMutation({
    mutationFn: (id) => {
      const review = reviews.find(r => r.id === id);
      return base44.entities.Review.update(id, { 
        is_pinned: !review?.is_pinned 
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contractorReviews', contractorId] })
  });

  const filteredReviews = {
    all: reviews,
    five: reviews.filter(r => r.overall_rating === 5),
    four: reviews.filter(r => r.overall_rating === 4),
    three: reviews.filter(r => r.overall_rating === 3),
    low: reviews.filter(r => r.overall_rating <= 2)
  };

  const stats = {
    total: reviews.length,
    avg: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1) : 0,
    verified: reviews.filter(r => r.verified).length,
    pinned: reviews.filter(r => r.is_pinned).length
  };

  const ReviewCard = ({ review }) => (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.overall_rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            {review.verified && (
              <Badge className="text-xs">✓ Verified</Badge>
            )}
          </div>
          <p className="font-semibold text-slate-900">{review.reviewer_name}</p>
          <p className="text-sm text-slate-600">{review.job_title}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => pinMutation.mutate(review.id)}
          className={review.is_pinned ? 'text-amber-500' : 'text-slate-400'}
        >
          <Pin className="w-4 h-4" />
        </Button>
      </div>

      {review.comment && (
        <p className="text-sm text-slate-700">{review.comment}</p>
      )}

      <div className="grid grid-cols-3 gap-2 pt-3 border-t text-xs">
        {review.quality_rating && (
          <div>
            <p className="text-slate-600">Quality</p>
            <p className="font-semibold text-slate-900">{review.quality_rating}/5</p>
          </div>
        )}
        {review.punctuality_rating && (
          <div>
            <p className="text-slate-600">Punctuality</p>
            <p className="font-semibold text-slate-900">{review.punctuality_rating}/5</p>
          </div>
        )}
        {review.communication_rating && (
          <div>
            <p className="text-slate-600">Communication</p>
            <p className="font-semibold text-slate-900">{review.communication_rating}/5</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
        <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.avg}</div>
          <p className="text-xs text-slate-600 mt-1">Average Rating</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <p className="text-xs text-slate-600 mt-1">Total Reviews</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          <p className="text-xs text-slate-600 mt-1">Verified</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.pinned}</div>
          <p className="text-xs text-slate-600 mt-1">Pinned</p>
        </Card>
      </div>

      {/* Reviews by Rating */}
      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="five">5★</TabsTrigger>
          <TabsTrigger value="four">4★</TabsTrigger>
          <TabsTrigger value="three">3★</TabsTrigger>
          <TabsTrigger value="low">Low</TabsTrigger>
        </TabsList>

        {Object.entries(filteredReviews).map(([key, items]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {items.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-500">No reviews in this category</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {items.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Low Rating Alert */}
      {filteredReviews.low.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Low Ratings Detected</p>
              <p className="text-sm text-red-800 mt-1">
                You have {filteredReviews.low.length} review(s) with ratings of 2 stars or lower. Consider reaching out to understand and improve.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}