import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, AlertCircle, ChevronDown, ChevronUp, CheckCircle, XCircle, Hourglass } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Hourglass,
    description: 'Waiting for the contractor to review your quote request.',
  },
  view_approved: {
    label: 'Preparing Scope & Estimate',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Clock,
    description: 'The contractor has accepted your quote request and is preparing a Scope of Work and Estimate.',
  },
  view_denied: {
    label: 'Declined',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    description: 'The contractor declined to provide a quote for this job.',
  },
  quoted: {
    label: 'Estimate Received',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'The contractor has provided their Scope of Work and Estimate.',
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Scope of Work and Estimate accepted.',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: XCircle,
    description: 'Scope of Work and Estimate rejected.',
  },
};

export default function QuoteComparisonDashboard({ customerEmail }) {
  const [expandedJob, setExpandedJob] = useState(null);

  const { data: quoteRequests, isLoading } = useQuery({
    queryKey: ['customer-quotes', customerEmail],
    queryFn: () => base44.entities.QuoteRequest.filter({ customer_email: customerEmail }),
    enabled: !!customerEmail,
  });

  // Group by job_title or work_description
  const groupedQuotes = useMemo(() => {
    if (!quoteRequests) return {};
    return quoteRequests.reduce((acc, quote) => {
      const key = quote.job_title || quote.work_description;
      if (!acc[key]) {
        acc[key] = { label: key, quotes: [] };
      }
      acc[key].quotes.push(quote);
      return acc;
    }, {});
  }, [quoteRequests]);

  if (isLoading) {
    return <Card className="p-6 text-center text-slate-500"><p>Loading quote requests...</p></Card>;
  }

  const jobCount = Object.keys(groupedQuotes).length;

  if (jobCount === 0) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No quote requests yet</h3>
        <p className="text-slate-600">Find a contractor and request a quote to get started.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Your Quote Requests ({quoteRequests.length})</h2>
      <p className="text-xs text-slate-500 -mt-2">A quote request asks a contractor to provide a Scope of Work and Estimate for your project.</p>

      {Object.entries(groupedQuotes).map(([key, group]) => {
        const isExpanded = expandedJob === key;
        const counts = group.quotes.reduce((acc, q) => {
          acc[q.status] = (acc[q.status] || 0) + 1;
          return acc;
        }, {});

        return (
          <Card key={key} className="overflow-hidden">
            <button
              onClick={() => setExpandedJob(isExpanded ? null : key)}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-left"
            >
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">{group.label}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {Object.entries(counts).map(([status, count]) => {
                    const cfg = STATUS_CONFIG[status];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    return (
                      <span key={status} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {count} {cfg.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
            </button>

            {isExpanded && (
              <div className="border-t border-slate-200 divide-y divide-slate-100">
                {group.quotes.map(quote => <QuoteCard key={quote.id} quote={quote} />)}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function QuoteCard({ quote }) {
  const cfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900 text-sm">{quote.contractor_name}</p>
          <p className="text-xs text-slate-500">{quote.contractor_email}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Requested {new Date(quote.created_at || quote.created_date).toLocaleDateString()}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold shrink-0 ${cfg.color}`}>
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </span>
      </div>

      {/* Status description */}
      <div className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${cfg.color} border`}>
        <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>{cfg.description}</span>
      </div>

      {/* Quote amount — only when quoted */}
      {quote.status === 'quoted' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Estimated Cost</p>
          <p className="text-2xl font-bold text-slate-900">${quote.quote_amount?.toFixed(2)}</p>
          {quote.responded_at && (
            <p className="text-xs text-slate-500 mt-1">Quoted {new Date(quote.responded_at).toLocaleDateString()}</p>
          )}
        </div>
      )}

      {/* Quote message */}
      {quote.quote_message && (
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Contractor's Note</p>
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{quote.quote_message}</p>
        </div>
      )}

      {/* Deny reason */}
      {quote.status === 'view_denied' && quote.deny_reason && (
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Reason</p>
          <p className="text-sm text-slate-700 bg-red-50 p-3 rounded-lg border border-red-100">{quote.deny_reason}</p>
        </div>
      )}

      {/* Response deadline for pending/view_approved */}
      {(quote.status === 'pending' || quote.status === 'view_approved') && quote.response_deadline && (
        <p className="text-xs text-slate-400">
          Response due by {new Date(quote.response_deadline).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}