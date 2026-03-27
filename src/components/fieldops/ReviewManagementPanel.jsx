import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Star, Send, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import useTierAccess from '@/hooks/useTierAccess';

export default function ReviewManagementPanel({ contractorEmail, contractorId }) {
  const [customerEmail, setCustomerEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { tier } = useTierAccess(contractorEmail);

  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', contractorId],
    queryFn: () => base44.entities.Review.filter({ contractor_id: contractorId }),
  });

  const requestMutation = useMutation({
    mutationFn: (email) =>
      base44.functions.invoke('createReviewEmailRequest', {
        contractor_email: contractorEmail,
        customer_email: email,
        contractor_id: contractorId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', contractorId] });
      setIsOpen(false);
      setCustomerEmail('');
    },
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (!tier?.reviewManagement) {
    return (
      <Card className="text-center py-8 border-dashed">
        <p className="text-muted-foreground">Review management is available on Licensed and Premium tiers.</p>
      </Card>
    );
  }

  if (isLoading) return <div className="text-center py-8">Loading reviews...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Review Management</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="w-4 h-4 mr-2" /> Request Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Review from Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Customer email address"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
              <Button
                onClick={() => requestMutation.mutate(customerEmail)}
                className="w-full"
                disabled={!customerEmail}
              >
                Send Review Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{averageRating}</div>
              <div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reviews.slice(0, 5).map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{review.reviewer_name}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.overall_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card className="text-center py-8">
          <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No reviews yet. Request reviews from your satisfied customers!</p>
        </Card>
      )}
    </div>
  );
}