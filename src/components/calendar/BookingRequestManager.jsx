import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function BookingRequestManager({ contractorId, contractorEmail }) {
  const [requests, setRequests] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const allRequests = await base44.entities.BookingRequest.filter({
        contractor_id: contractorId,
      });
      setRequests((allRequests || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleResponse = async (requestId, status) => {
    setLoading(true);
    try {
      await base44.entities.BookingRequest.update(requestId, {
        status,
        contractor_response: responseText,
        responded_at: new Date().toISOString(),
      });

      // Find the request to get customer email
      const request = requests.find(r => r.id === requestId);
      const statusLabel = status === 'confirmed' ? 'confirmed' : 'declined';
      
      await base44.integrations.Core.SendEmail({
        to: request.customer_email,
        subject: `Booking ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)} from ${request.contractor_email}`,
        body: `Hi ${request.customer_name},\n\nYour booking request for ${request.requested_start_date} has been ${statusLabel}.\n\n${responseText ? `Contractor's message: ${responseText}` : ''}\n\nSurfCoast Contractor Market Place`,
      });

      setResponseText('');
      setExpandedId(null);
      await fetchRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
    }
    setLoading(false);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const respondedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card className="p-6 border-amber-200 bg-amber-50">
        <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pending Booking Requests ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-amber-700">No pending booking requests.</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div
                key={request.id}
                className="bg-white border border-amber-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{request.customer_name}</p>
                    <p className="text-sm text-slate-600">{request.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {new Date(request.requested_start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {request.requested_start_time && (
                      <p className="text-sm text-slate-600">{request.requested_start_time}</p>
                    )}
                  </div>
                </div>

                {expandedId === request.id && (
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <Textarea
                      placeholder="Your response (optional)"
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      className="min-h-[80px] mb-3"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleResponse(request.id, 'confirmed')}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm
                      </Button>
                      <Button
                        onClick={() => handleResponse(request.id, 'declined')}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        onClick={() => {
                          setExpandedId(null);
                          setResponseText('');
                        }}
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {expandedId !== request.id && (
                  <Button
                    onClick={() => setExpandedId(request.id)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Respond
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Responded Requests */}
      {respondedRequests.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Response History</h2>
          <div className="space-y-2">
            {respondedRequests.map(request => (
              <div
                key={request.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  request.status === 'confirmed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{request.customer_name}</p>
                  <p className="text-xs text-slate-600">{request.requested_start_date}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      request.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}