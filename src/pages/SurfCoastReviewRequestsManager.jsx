import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import SurfCoastReviewRequestCard from '@/components/review/SurfCoastReviewRequestCard';

export default function SurfCoastReviewRequestsManager() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, sent, failed

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const reviewRequests = await base44.entities.ReviewEmailRequest.filter({
        contractor_email: currentUser.email,
      });

      setRequests(reviewRequests || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load review requests:', err);
      setError('Failed to load review requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this review request?')) return;

    try {
      await base44.entities.ReviewEmailRequest.update(requestId, {
        status: 'cancelled',
      });
      await loadData();
    } catch (err) {
      console.error('Failed to cancel request:', err);
      setError('Failed to cancel review request');
    }
  };

  const handleResendEmail = async (requestId) => {
    try {
      // Call the send function for this specific request
      await base44.functions.invoke('sendScheduledReviewEmails', {});
      await loadData();
    } catch (err) {
      console.error('Failed to resend email:', err);
      setError('Failed to resend email');
    }
  };

  const filteredRequests =
    filter === 'all'
      ? requests
      : requests.filter((r) => r.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    sent: requests.filter((r) => r.status === 'sent').length,
    failed: requests.filter((r) => r.status === 'failed').length,
    submitted: requests.filter((r) => r.review_submitted).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">SurfCoast Review Requests Manager</h1>
            <p className="text-slate-600 mt-2">
              Manage automated review requests sent to customers after job completion.
            </p>
          </div>
          <Button onClick={loadData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Error banner */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Requests', value: stats.total, color: 'slate' },
            { label: 'Pending', value: stats.pending, color: 'yellow' },
            { label: 'Sent', value: stats.sent, color: 'green' },
            { label: 'Failed', value: stats.failed, color: 'red' },
            { label: 'Reviews Submitted', value: stats.submitted, color: 'blue' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className={`text-3xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </div>
                <p className="text-sm text-slate-600 mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'sent', 'failed'].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status)}
              variant={filter === status ? 'default' : 'outline'}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Review requests list */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-slate-600">
                  {filter === 'all'
                    ? 'No review requests yet. They will appear here when jobs are completed.'
                    : `No ${filter} review requests.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <SurfCoastReviewRequestCard
                key={request.id}
                request={request}
                onCancel={handleCancelRequest}
                onResend={handleResendEmail}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}