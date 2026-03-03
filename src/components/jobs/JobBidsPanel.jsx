import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DollarSign, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function JobBidsPanel({ job, onClose }) {
  const queryClient = useQueryClient();

  const { data: bids, isLoading } = useQuery({
    queryKey: ['job-bids', job.id],
    queryFn: () => base44.entities.Bid.filter({ job_id: job.id }, '-created_date'),
  });

  const acceptBidMutation = useMutation({
    mutationFn: (bidId) => base44.entities.Bid.update(bidId, { status: 'accepted' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-bids', job.id] });
    },
  });

  const rejectBidMutation = useMutation({
    mutationFn: (bidId) => base44.entities.Bid.update(bidId, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-bids', job.id] });
    },
  });

  const pendingBids = useMemo(() => bids?.filter(b => b.status === 'pending') || [], [bids]);
  const acceptedBids = useMemo(() => bids?.filter(b => b.status === 'accepted') || [], [bids]);
  const rejectedBids = useMemo(() => bids?.filter(b => b.status === 'rejected') || [], [bids]);

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-amber-500" />,
    accepted: <CheckCircle className="w-4 h-4 text-green-600" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
  };

  const statusColors = {
    pending: 'bg-amber-50 border-amber-200',
    accepted: 'bg-green-50 border-green-200',
    rejected: 'bg-red-50 border-red-200',
  };

  const renderBid = (bid) => (
    <Card key={bid.id} className={`p-4 border ${statusColors[bid.status]}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900">{bid.contractor_name}</h4>
            <div className="flex items-center gap-1">
              {statusIcons[bid.status]}
              <Badge variant="outline" className="text-xs capitalize">
                {bid.status}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-slate-600">{bid.contractor_email}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-lg font-bold text-slate-900">
            <DollarSign className="w-4 h-4" />
            {bid.proposed_amount.toLocaleString()}
          </div>
          {bid.estimated_duration && (
            <p className="text-xs text-slate-500">{bid.estimated_duration}</p>
          )}
        </div>
      </div>

      {bid.cover_letter && (
        <div className="mb-4 p-3 bg-white rounded border border-slate-200">
          <p className="text-sm text-slate-700 line-clamp-3">{bid.cover_letter}</p>
        </div>
      )}

      {bid.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => acceptBidMutation.mutate(bid.id)}
            disabled={acceptBidMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => rejectBidMutation.mutate(bid.id)}
            disabled={rejectBidMutation.isPending}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bids for {job.title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : bids?.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No bids received yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingBids.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Pending Bids ({pendingBids.length})</h3>
                <div className="space-y-3">
                  {pendingBids.map(renderBid)}
                </div>
              </div>
            )}

            {acceptedBids.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Accepted ({acceptedBids.length})</h3>
                <div className="space-y-3">
                  {acceptedBids.map(renderBid)}
                </div>
              </div>
            )}

            {rejectedBids.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Rejected ({rejectedBids.length})</h3>
                <div className="space-y-3">
                  {rejectedBids.map(renderBid)}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}