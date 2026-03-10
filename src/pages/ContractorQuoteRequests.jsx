import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import QuoteReplyDialog from '@/components/quote/QuoteReplyDialog';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Response' },
  quoted: { color: 'bg-blue-100 text-blue-800', icon: MessageSquare, label: 'Quoted' },
  accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
};

export default function ContractorQuoteRequests() {
  const [contractor, setContractor] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  useEffect(() => {
    const loadContractor = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const contractors = await base44.entities.Contractor.filter({ email: user.email });
          if (contractors && contractors.length > 0) {
            setContractor(contractors[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load contractor:', error);
      }
    };
    loadContractor();
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['quoteRequests', contractor?.id],
    queryFn: async () => {
      if (!contractor?.id) return [];
      const requests = await base44.entities.QuoteRequest.filter({ contractor_id: contractor.id });
      return requests || [];
    },
    enabled: !!contractor?.id,
  });

  const handleReplyClick = (request) => {
    setSelectedRequest(request);
    setReplyDialogOpen(true);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const respondedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Quote Requests</h1>
          <p className="text-slate-600">Manage incoming quote requests from customers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</div>
                <div className="text-sm text-slate-600">Pending Responses</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{requests.filter(r => r.status === 'quoted').length}</div>
                <div className="text-sm text-slate-600">Quoted</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{requests.filter(r => r.status === 'accepted').length}</div>
                <div className="text-sm text-slate-600">Accepted</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{requests.filter(r => r.status === 'rejected').length}</div>
                <div className="text-sm text-slate-600">Rejected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Awaiting Your Response</h2>
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <QuoteRequestCard
                  key={request.id}
                  request={request}
                  onReply={handleReplyClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Responded Requests */}
        {respondedRequests.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Response History</h2>
            <div className="space-y-4">
              {respondedRequests.map(request => (
                <QuoteRequestCard
                  key={request.id}
                  request={request}
                  onReply={handleReplyClick}
                />
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && !isLoading && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Quote Requests Yet</h3>
              <p className="text-slate-500">Your quote requests will appear here when customers request estimates from you.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <QuoteReplyDialog
        request={selectedRequest}
        open={replyDialogOpen}
        onClose={() => {
          setReplyDialogOpen(false);
          setSelectedRequest(null);
        }}
      />
    </div>
  );
}

function QuoteRequestCard({ request, onReply }) {
  const config = statusConfig[request.status];
  const Icon = config.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">{request.customer_name}</h3>
              <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <p className="text-slate-600 mb-2">{request.work_description}</p>
            <p className="text-sm text-slate-500">From: {request.customer_email}</p>
          </div>
        </div>

        {request.quote_amount && (
          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <div className="text-sm text-slate-600">Your Quote</div>
            <div className="text-2xl font-bold text-slate-900">${request.quote_amount}</div>
            {request.quote_message && (
              <p className="text-sm text-slate-600 mt-2">{request.quote_message}</p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {request.status === 'pending' && (
            <Button
              onClick={() => onReply(request)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Quote
            </Button>
          )}
          {request.status === 'quoted' && (
            <Button
              onClick={() => onReply(request)}
              variant="outline"
            >
              Edit Quote
            </Button>
          )}
          {request.status === 'accepted' && (
            <div className="text-sm text-green-600 font-medium">Customer accepted your quote</div>
          )}
          {request.status === 'rejected' && (
            <div className="text-sm text-red-600 font-medium">Customer rejected your quote</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}