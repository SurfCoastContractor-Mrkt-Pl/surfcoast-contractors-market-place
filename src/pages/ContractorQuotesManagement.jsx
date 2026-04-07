import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ExampleBanner from '@/components/examples/ExampleBanner';
import useExampleVisibility from '@/hooks/useExampleVisibility';

const EXAMPLE_QUOTE = {
  id: 'example-quote',
  job_title: 'Kitchen Cabinet Installation',
  work_description: 'Install 10 new kitchen cabinets including upper and lower units. Customer has cabinets ready, needs professional installation and alignment.',
  customer_name: 'Maria Torres',
  customer_email: 'maria.torres@example.com',
  status: 'pending',
  budget: '$800 - $1,200',
  response_deadline: '2026-04-05T00:00:00Z',
  created_at: '2026-03-28T08:00:00Z',
};
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, MessageSquare, FileText, AlertCircle, CheckCircle2, Search, ChevronDown } from 'lucide-react';
import QuoteResponseModal from '@/components/quotes/QuoteResponseModal';
import QuoteDetailModal from '@/components/quotes/QuoteDetailModal';

export default function ContractorQuotesManagement() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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

  const { data: contractor } = useQuery({
    queryKey: ['contractor-for-examples', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const contractors = await base44.entities.Contractor.filter({ email: user.email });
      return contractors?.[0];
    },
    enabled: !!user?.email,
  });
  const completedJobs = contractor?.completed_jobs_count || 0;
  const { showExamples, toggleExamples, autoHidden } = useExampleVisibility('quotes', completedJobs);

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
    const matchesTab = activeTab === 'pending' ? quote.status === 'pending'
      : activeTab === 'in_progress' ? ['in_progress', 'quoted'].includes(quote.status)
      : ['accepted', 'completed', 'rejected'].includes(quote.status);
    
    const matchesSearch = !searchTerm || 
      quote.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  })?.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'deadline') {
      if (!a.response_deadline) return 1;
      if (!b.response_deadline) return -1;
      return new Date(a.response_deadline) - new Date(b.response_deadline);
    }
    return 0;
  }) || [];

  const openAction = (quote, type) => {
    setSelectedQuote(quote);
    setActionType(type);
    setResponseModalOpen(true);
  };

  const openDetailView = (quote) => {
    setSelectedQuote(quote);
    setDetailModalOpen(true);
  };

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 32, paddingBottom: 32, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Proposal Requests</h1>
          <p style={{ color: T.muted, fontStyle: "italic" }}>Manage incoming client proposal requests and send proposals to clients</p>
        </div>

        {/* Example Entry */}
        <ExampleBanner showExamples={showExamples} onToggle={toggleExamples} autoHidden={autoHidden}>
          <div className="p-5 bg-white rounded-lg border border-amber-200">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <p className="font-semibold text-slate-900">{EXAMPLE_QUOTE.job_title}</p>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">Pending</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{EXAMPLE_QUOTE.work_description}</p>
                <div className="flex gap-6 text-sm flex-wrap">
                  <div>
                    <p className="font-medium text-slate-900">{EXAMPLE_QUOTE.customer_name}</p>
                    <p className="text-slate-500">{EXAMPLE_QUOTE.customer_email}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Budget</p>
                    <p className="text-slate-500">{EXAMPLE_QUOTE.budget}</p>
                  </div>
                </div>
                <p className="text-xs text-orange-600 mt-2">Respond by: Apr 5, 2026</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 italic">Example — not a real request</p>
              </div>
            </div>
          </div>
        </ExampleBanner>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by job title, client name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="deadline">Deadline Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                <p className="text-slate-600">No pending proposal requests</p>
              </Card>
            ) : (
              filteredQuotes.map(quote => (
                <Card key={quote.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex-1 cursor-pointer hover:text-blue-600"
                      onClick={() => openDetailView(quote)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{quote.job_title}</h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{quote.work_description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{quote.customer_name}</p>
                          <p className="text-slate-600">{quote.customer_email}</p>
                        </div>
                        {quote.budget && (
                          <div>
                            <p className="font-medium text-slate-900">Client Budget</p>
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
                        Send Proposal
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
                <p className="text-slate-600">No proposals in progress</p>
              </Card>
            ) : (
              filteredQuotes.map(quote => (
                <Card
                  key={quote.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openDetailView(quote)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{quote.job_title}</h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{quote.work_description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{quote.customer_name}</p>
                          <p className="text-slate-600">{quote.customer_email}</p>
                        </div>
                        {quote.contractor_estimate && (
                          <div>
                            <p className="font-medium text-slate-900">Your Proposal</p>
                            <p className="text-slate-600">${quote.contractor_estimate.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAction(quote, 'message');
                      }}
                      className="flex-shrink-0"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
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
                <p className="text-slate-600">No completed proposals</p>
              </Card>
            ) : (
              filteredQuotes.map(quote => (
                <Card
                  key={quote.id}
                  className="p-6 hover:shadow-lg transition-shadow opacity-75 cursor-pointer"
                  onClick={() => openDetailView(quote)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{quote.job_title}</h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{quote.work_description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{quote.customer_name}</p>
                          <p className="text-slate-600">{quote.customer_email}</p>
                        </div>
                        {quote.contractor_estimate && (
                          <div>
                            <p className="font-medium text-slate-900">Your Proposal</p>
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

      {/* Detail Modal */}
      {selectedQuote && (
        <QuoteDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          quote={selectedQuote}
          onSendProposal={() => {
            setDetailModalOpen(false);
            openAction(selectedQuote, 'proposal');
          }}
          onSendMessage={() => {
            setDetailModalOpen(false);
            openAction(selectedQuote, 'message');
          }}
        />
      )}

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