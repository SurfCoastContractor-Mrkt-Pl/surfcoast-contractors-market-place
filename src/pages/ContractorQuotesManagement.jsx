import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import QuoteResponseModal from '@/components/quotes/QuoteResponseModal';

export default function ContractorQuotesManagement() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await base44.auth.me();
        if (me) {
          setUser(me);
        } else {
          base44.auth.redirectToLogin();
        }
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quoteRequests', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const results = await base44.entities.QuoteRequest.filter({
        contractor_email: user.email
      }, '-created_at');
      return results || [];
    },
    enabled: !!user?.email
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredQuotes = quotes?.filter(quote => {
    if (activeTab === 'pending') return quote.status === 'pending';
    if (activeTab === 'in_progress') return ['in_progress', 'quoted'].includes(quote.status);
    if (activeTab === 'completed') return ['accepted', 'completed', 'rejected'].includes(quote.status);
    return true;
  }) || [];

  const openAction = (quote, type) => {
    setSelectedQuote(quote);
    setActionType(type);
    setResponseModalOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Quote Requests</h1>
          <p className="text-slate-600">Manage incoming client quote requests and send estimates</p>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({quotes?.filter(q => q.status === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({quotes?.filter(q => ['in_progress', 'quoted'].includes(q.status)).length || 0})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({quotes?.filter(q => ['accepted', 'completed', 'rejected'].includes(q.status)).length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Pending Quotes */}
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600">No pending quote requests</p>
              </Card>
            ) : (
              filteredQuotes.map(quote => (
                <Card key={quote.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{quote.job_title}</h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{quote.work_description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{quote.customer_name}</p>
                          <p className="text-slate-600">{quote.customer_email}</p>
                        </div>
                        {quote.budget && (
                          <div>
                            <p className="font-medium text-slate-900">Budget</p>
                            <p className="text-slate-600">{quote.budget}</p>
                          </div>
                        )}
                      </div>
                      {quote.response_deadline && (
                        <p className="text-xs text-orange-600 mt-3">
                          Respond by: {new Date(quote.response_deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => openAction(quote, 'estimate')}
                        className="gap-2 whitespace-nowrap"
                      >
                        <FileText className="w-4 h-4" />
                        Send Estimate
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openAction(quote, 'message')}
                        className="gap-2 whitespace-nowrap"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* In Progress Quotes */}
          <TabsContent value="in_progress" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600">No quotes in progress</p>
              </Card>
            ) : (
              filteredQuotes.map(quote => (
                <Card key={quote.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{quote.job_title}</h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{quote.work_description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{quote.customer_name}</p>
                          <p className="text-slate-600">{quote.customer_email}</p>
                        </div>
                        {quote.contractor_estimate && (
                          <div>
                            <p className="font-medium text-slate-900">Your Estimate</p>
                            <p className="text-slate-600">${quote.contractor_estimate.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openAction(quote, 'message')}
                        className="gap-2 whitespace-nowrap"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Completed Quotes */}
          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600">No completed quotes</p>
              </Card>
            ) : (
              filteredQuotes.map(quote => (
                <Card key={quote.id} className="p-6 hover:shadow-lg transition-shadow opacity-75">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{quote.job_title}</h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{quote.work_description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{quote.customer_name}</p>
                          <p className="text-slate-600">{quote.customer_email}</p>
                        </div>
                        {quote.contractor_estimate && (
                          <div>
                            <p className="font-medium text-slate-900">Your Estimate</p>
                            <p className="text-slate-600">${quote.contractor_estimate.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Response Modal */}
      {selectedQuote && (
        <QuoteResponseModal
          open={responseModalOpen}
          onOpenChange={setResponseModalOpen}
          quote={selectedQuote}
          actionType={actionType}
          onSuccess={() => {
            setResponseModalOpen(false);
            setSelectedQuote(null);
          }}
        />
      )}
    </div>
  );
}