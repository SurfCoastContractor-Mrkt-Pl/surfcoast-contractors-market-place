import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, DollarSign, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function QuoteComparisonDashboard({ customerEmail }) {
  const [expandedJob, setExpandedJob] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  const { data: quoteRequests, isLoading } = useQuery({
    queryKey: ['customer-quotes', customerEmail],
    queryFn: () => base44.entities.QuoteRequest.filter({ 
      customer_email: customerEmail,
      status: { $in: ['pending', 'quoted'] }
    }),
    enabled: !!customerEmail,
  });

  // Group quotes by job/work_description
  const groupedQuotes = useMemo(() => {
    if (!quoteRequests) return {};
    
    return quoteRequests.reduce((acc, quote) => {
      const key = quote.work_description;
      if (!acc[key]) {
        acc[key] = {
          description: quote.work_description,
          quotes: [],
        };
      }
      acc[key].quotes.push(quote);
      return acc;
    }, {});
  }, [quoteRequests]);

  if (isLoading) {
    return (
      <Card className="p-6 text-center text-slate-500">
        <p>Loading quote requests...</p>
      </Card>
    );
  }

  const jobCount = Object.keys(groupedQuotes).length;

  if (jobCount === 0) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No active quote requests</h3>
        <p className="text-slate-600">Quotes you request will appear here for comparison.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Active Quote Requests ({jobCount})
        </h2>
        <Button
          size="sm"
          variant={compareMode ? 'default' : 'outline'}
          onClick={() => setCompareMode(!compareMode)}
          className={compareMode ? 'bg-amber-500 hover:bg-amber-600' : ''}
        >
          {compareMode ? '✓ Compare Mode' : 'Compare Quotes'}
        </Button>
      </div>

      {/* Jobs with Quotes */}
      <div className="space-y-4">
        {Object.entries(groupedQuotes).map(([jobDesc, job]) => {
          const isExpanded = expandedJob === jobDesc;
          const quotedCount = job.quotes.filter(q => q.status === 'quoted').length;
          const pendingCount = job.quotes.filter(q => q.status === 'pending').length;

          return (
            <Card key={jobDesc} className="overflow-hidden">
              {/* Job Header */}
              <button
                onClick={() => setExpandedJob(isExpanded ? null : jobDesc)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{jobDesc}</h3>
                    <div className="flex gap-2 mt-1">
                      {quotedCount > 0 && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {quotedCount} quoted
                        </Badge>
                      )}
                      {pendingCount > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          {pendingCount} pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Expanded View */}
              {isExpanded && (
                <div className="border-t border-slate-200 p-4">
                  {compareMode ? (
                    <ComparisonTable quotes={job.quotes} />
                  ) : (
                    <QuoteList quotes={job.quotes} />
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function QuoteList({ quotes }) {
  return (
    <div className="space-y-3">
      {quotes.map(quote => (
        <div key={quote.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">{quote.contractor_name}</h4>
              <p className="text-sm text-slate-500">{quote.contractor_email}</p>
            </div>
            <Badge className={
              quote.status === 'quoted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }>
              {quote.status === 'quoted' ? '✓ Quoted' : 'Pending'}
            </Badge>
          </div>

          {quote.status === 'quoted' && (
            <div className="grid md:grid-cols-2 gap-4 py-3 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Estimated Cost</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ${quote.quote_amount?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Requested {new Date(quote.created_date).toLocaleDateString()}</p>
                {quote.responded_at && (
                  <p className="text-sm text-slate-600 mt-1">
                    Responded {new Date(quote.responded_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {quote.quote_message && (
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Message from Contractor</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{quote.quote_message}</p>
            </div>
          )}

          {quote.status === 'pending' && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              <Clock className="w-4 h-4 shrink-0" />
              Waiting for contractor response (due {new Date(new Date(quote.created_date).getTime() + 48*60*60*1000).toLocaleDateString()})
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ComparisonTable({ quotes }) {
  const quotedQuotes = quotes.filter(q => q.status === 'quoted').sort((a, b) => a.quote_amount - b.quote_amount);

  if (quotedQuotes.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No quotes received yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Contractor</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-900">Quote Amount</th>
            <th className="text-center py-3 px-4 font-semibold text-slate-900">Response Time</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Notes</th>
          </tr>
        </thead>
        <tbody>
          {quotedQuotes.map((quote, idx) => {
            const responseTime = quote.responded_at ? 
              Math.floor((new Date(quote.responded_at) - new Date(quote.created_date)) / (1000 * 60 * 60)) :
              0;
            const isLowest = idx === 0;

            return (
              <tr key={quote.id} className={`border-b border-slate-100 ${isLowest ? 'bg-green-50' : ''}`}>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-slate-900">{quote.contractor_name}</p>
                    <p className="text-xs text-slate-500">{quote.contractor_email}</p>
                  </div>
                </td>
                <td className="text-right py-3 px-4">
                  <p className="text-lg font-bold text-slate-900">${quote.quote_amount?.toFixed(2)}</p>
                  {isLowest && <Badge className="bg-green-100 text-green-700 text-xs mt-1">Lowest</Badge>}
                </td>
                <td className="text-center py-3 px-4">
                  <p className="text-slate-600">{responseTime}h</p>
                </td>
                <td className="py-3 px-4">
                  {quote.quote_message ? (
                    <p className="text-xs text-slate-600 line-clamp-2">{quote.quote_message}</p>
                  ) : (
                    <p className="text-xs text-slate-400">—</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}