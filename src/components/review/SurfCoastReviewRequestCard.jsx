import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, Copy } from 'lucide-react';
import { format } from 'date-fns';

export default function SurfCoastReviewRequestCard({
  request,
  onCancel,
  onResend,
}) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'bg-yellow-50 border-yellow-200',
      badgeClass: 'bg-yellow-100 text-yellow-800',
      text: 'Pending',
    },
    sent: {
      icon: CheckCircle2,
      color: 'bg-green-50 border-green-200',
      badgeClass: 'bg-green-100 text-green-800',
      text: 'Sent',
    },
    failed: {
      icon: AlertCircle,
      color: 'bg-red-50 border-red-200',
      badgeClass: 'bg-red-100 text-red-800',
      text: 'Failed',
    },
    cancelled: {
      icon: AlertCircle,
      color: 'bg-slate-50 border-slate-200',
      badgeClass: 'bg-slate-100 text-slate-800',
      text: 'Cancelled',
    },
  };

  const config = statusConfig[request.status];
  const Icon = config.icon;

  const handleCopyLink = () => {
    const reviewLink = `${window.location.origin}/review-submission?token=${request.review_link_token}`;
    navigator.clipboard.writeText(reviewLink);
  };

  return (
    <Card className={`${config.color} border`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 mt-1 text-slate-600" />
            <div>
              <CardTitle className="text-base">{request.job_title}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{request.customer_name}</p>
              <p className="text-xs text-slate-500">{request.customer_email}</p>
            </div>
          </div>
          <Badge className={config.badgeClass}>{config.text}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Timeline info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Job Closed:</span>
            <span className="font-medium">
              {format(new Date(request.scope_closed_at), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Email {request.status === 'pending' ? 'Scheduled' : 'Sent'}:</span>
            <span className="font-medium">
              {request.status === 'pending'
                ? format(new Date(request.email_send_at), 'MMM d, yyyy h:mm a')
                : request.email_sent_at
                ? format(new Date(request.email_sent_at), 'MMM d, yyyy h:mm a')
                : 'N/A'}
            </span>
          </div>

          {request.review_submitted && request.review_submitted_at && (
            <div className="flex justify-between text-green-700">
              <span>Review Submitted:</span>
              <span className="font-medium">
                {format(new Date(request.review_submitted_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          )}

          {request.error_message && (
            <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-xs">
              Error: {request.error_message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-200">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="flex-1"
          >
            <Copy className="w-3 h-3 mr-1" /> Copy Link
          </Button>

          {request.status === 'failed' && onResend && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResend(request.id)}
              className="flex-1"
            >
              Retry
            </Button>
          )}

          {request.status !== 'cancelled' && onCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(request.id)}
              className="flex-1 text-red-600 hover:text-red-700"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}