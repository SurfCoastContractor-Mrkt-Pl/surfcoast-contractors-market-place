import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase, Clock, CheckCircle2, XCircle, Eye, DollarSign,
  Bell, CalendarDays, MapPin, MessageSquare, TrendingUp, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const QUOTE_STATUS_CONFIG = {
  pending:  { label: 'Awaiting Response', color: 'bg-amber-100 text-amber-700', icon: Clock },
  viewed:   { label: 'Viewed by Customer', color: 'bg-blue-100 text-blue-700', icon: Eye },
  accepted: { label: 'Accepted!', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Declined', color: 'bg-red-100 text-red-600', icon: XCircle },
};

const JOB_MATCH_STATUS_CONFIG = {
  open:        { label: 'Open', color: 'bg-green-100 text-green-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  completed:   { label: 'Completed', color: 'bg-slate-100 text-slate-600' },
  cancelled:   { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
};

function QuoteCard({ quote }) {
  const config = QUOTE_STATUS_CONFIG[quote.status] || QUOTE_STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 truncate">{quote.job_title}</h4>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{quote.message}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              ${quote.price?.toLocaleString()} ({quote.price_type})
            </span>
            {quote.availability_date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                Available {new Date(quote.availability_date).toLocaleDateString()}
              </span>
            )}
            <span className="text-slate-400">
              Submitted {new Date(quote.created_date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Badge className={`${config.color} shrink-0 flex items-center gap-1 text-xs`}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </Badge>
      </div>
      {quote.status === 'accepted' && (
        <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 font-medium">
            The customer accepted your quote! They may reach out to you directly or via the platform.
          </p>
        </div>
      )}
    </div>
  );
}

function MatchedJobCard({ notification, contractor }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 truncate">{notification.job_title}</h4>
          {notification.match_reason && (
            <p className="text-xs text-slate-500 mt-1">{notification.match_reason}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
            {notification.match_score != null && (
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                {notification.match_score}% match
              </span>
            )}
            <span className="text-slate-400">
              Matched {new Date(notification.created_date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <Badge className="bg-blue-100 text-blue-700 text-xs">New Match</Badge>
        </div>
      </div>
      <div className="mt-3">
        <Link to={`${createPageUrl('Jobs')}`}>
          <Button size="sm" className="text-white text-xs" style={{ backgroundColor: '#1E5A96' }}>
            <Briefcase className="w-3 h-3 mr-1" /> View Job
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ActiveScopeCard({ scope }) {
  const statusConfig = {
    pending_approval: { label: 'Pending Customer Approval', color: 'bg-amber-100 text-amber-700' },
    approved:         { label: 'Active', color: 'bg-green-100 text-green-700' },
    rejected:         { label: 'Rejected', color: 'bg-red-100 text-red-600' },
    pending_ratings:  { label: 'Pending Ratings', color: 'bg-purple-100 text-purple-700' },
    closed:           { label: 'Closed', color: 'bg-slate-100 text-slate-500' },
  };
  const config = statusConfig[scope.status] || statusConfig.pending_approval;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-sm transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 truncate">{scope.job_title}</h4>
            <p className="text-sm text-slate-500 mt-0.5">Customer: {scope.customer_name}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {scope.cost_type === 'fixed'
                  ? `$${scope.cost_amount?.toLocaleString()} fixed`
                  : `$${scope.cost_amount}/hr`}
              </span>
              {scope.agreed_work_date && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {new Date(scope.agreed_work_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <Badge className={`${config.color} text-xs shrink-0`}>{config.label}</Badge>
        </div>

        {/* Step tracker */}
        <div className="mt-4">
          <div className="flex items-center gap-0">
            {[
              { key: 'submitted', label: 'Submitted', done: true },
              { key: 'approved', label: 'Approved', done: ['approved', 'pending_ratings', 'closed'].includes(scope.status) },
              { key: 'work', label: 'Work Done', done: ['pending_ratings', 'closed'].includes(scope.status) },
              { key: 'closed', label: 'Closed', done: scope.status === 'closed' },
            ].map((step, i, arr) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 whitespace-nowrap ${step.done ? 'text-green-600 font-medium' : 'text-slate-400'}`}>{step.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 ${arr[i + 1].done ? 'bg-green-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractorMyJobs({ contractorId, contractorEmail }) {
  const [tab, setTab] = useState('quotes');

  const { data: myQuotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['contractor-my-quotes', contractorEmail],
    queryFn: () => base44.entities.Quote.filter({ contractor_email: contractorEmail }),
    enabled: !!contractorEmail,
  });

  const { data: matchedJobs = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['contractor-job-matches', contractorEmail],
    queryFn: () => base44.entities.JobNotification.filter({ contractor_email: contractorEmail }),
    enabled: !!contractorEmail,
    select: (data) => [...data].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 30),
  });

  const { data: scopes = [], isLoading: scopesLoading } = useQuery({
    queryKey: ['contractor-scopes-myjobs', contractorId],
    queryFn: () => base44.entities.ScopeOfWork.filter({ contractor_id: contractorId }),
    enabled: !!contractorId,
  });

  const acceptedQuotes = myQuotes.filter(q => q.status === 'accepted');
  const pendingQuotes = myQuotes.filter(q => q.status === 'pending' || q.status === 'viewed');
  const activeScopes = scopes.filter(s => s.status !== 'closed');
  const completedScopes = scopes.filter(s => s.status === 'closed');

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Quotes Sent', value: myQuotes.length, icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending Response', value: pendingQuotes.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Quotes Accepted', value: acceptedQuotes.length, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Active Projects', value: activeScopes.length, icon: Briefcase, color: 'text-purple-600 bg-purple-50' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500 leading-tight">{stat.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="quotes" className="flex-1 text-xs sm:text-sm">
            My Quotes
            {pendingQuotes.length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{pendingQuotes.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex-1 text-xs sm:text-sm">
            Matched Jobs
            {matchedJobs.length > 0 && (
              <span className="ml-1.5 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{matchedJobs.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 text-xs sm:text-sm">
            Active Projects
            {activeScopes.length > 0 && (
              <span className="ml-1.5 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{activeScopes.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-xs sm:text-sm">
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="mt-4">
          {quotesLoading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : myQuotes.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600">No quotes submitted yet</p>
              <p className="text-sm text-slate-400 mt-1">Browse open jobs and submit your first quote.</p>
              <Link to={createPageUrl('Jobs')} className="mt-4 inline-block">
                <Button size="sm" style={{ backgroundColor: '#1E5A96' }} className="text-white mt-3">Browse Jobs</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {[...myQuotes].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(quote => (
                <QuoteCard key={quote.id} quote={quote} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Matched Jobs Tab */}
        <TabsContent value="matches" className="mt-4">
          {matchesLoading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : matchedJobs.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600">No job matches yet</p>
              <p className="text-sm text-slate-400 mt-1">The platform automatically matches new jobs to your profile. Check back soon!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {matchedJobs.map(n => (
                <MatchedJobCard key={n.id} notification={n} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active Projects Tab */}
        <TabsContent value="active" className="mt-4">
          {scopesLoading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : activeScopes.length === 0 ? (
            <Card className="p-8 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600">No active projects</p>
              <p className="text-sm text-slate-400 mt-1">Once a customer approves a scope of work, it will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeScopes.map(s => <ActiveScopeCard key={s.id} scope={s} />)}
            </div>
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="mt-4">
          {scopesLoading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : completedScopes.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600">No completed jobs yet</p>
              <p className="text-sm text-slate-400 mt-1">Completed and closed scopes of work will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedScopes.map(s => (
                <div key={s.id} className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{s.job_title}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">Customer: {s.customer_name}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {s.cost_type === 'fixed' ? `$${s.cost_amount?.toLocaleString()} fixed` : `$${s.cost_amount}/hr`}
                        </span>
                        {s.closed_date && (
                          <span>Closed {new Date(s.closed_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-slate-100 text-slate-500 text-xs shrink-0">Closed</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}