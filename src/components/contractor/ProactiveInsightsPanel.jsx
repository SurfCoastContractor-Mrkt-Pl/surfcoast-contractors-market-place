import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, RefreshCw, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProactiveInsightsPanel({ contractor, scopes = [], payments = [] }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateInsights = async () => {
    if (!contractor) return;
    setLoading(true);
    try {
      const completedJobs = contractor.completed_jobs_count || 0;
      const rating = contractor.rating || 'N/A';
      const lineOfWork = contractor.line_of_work?.replace(/_/g, ' ') || contractor.trade_specialty || 'general contracting';
      const location = contractor.location || 'your area';
      const activeScopes = scopes.filter(s => s.status === 'approved').length;
      const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a business advisor for an independent contractor. Generate 3 short, actionable, specific insights for this contractor:
- Name: ${contractor.name}
- Trade/Line of Work: ${lineOfWork}
- Location: ${location}
- Completed Jobs: ${completedJobs}
- Current Rating: ${rating}/5
- Active Jobs Right Now: ${activeScopes}
- Total Platform Earnings: $${totalEarnings.toFixed(2)}
- Availability Status: ${contractor.availability_status || 'available'}

Generate exactly 3 insights. Each insight should be direct and actionable — not generic. Focus on: pricing strategy, lead generation timing, or profile optimization based on their specific data. Keep each insight under 2 sentences.`,
        response_json_schema: {
          type: 'object',
          properties: {
            insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  title: { type: 'string' },
                  body: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setInsights(result?.insights || []);
      setGenerated(true);
    } catch (e) {
      console.error('Insights generation failed:', e);
    }
    setLoading(false);
  };

  const typeIcon = (type) => {
    if (type?.includes('pricing') || type?.includes('earn')) return TrendingUp;
    if (type?.includes('alert') || type?.includes('warning')) return AlertCircle;
    return Lightbulb;
  };

  const typeColor = (type) => {
    if (type?.includes('pricing') || type?.includes('earn')) return 'text-green-600 bg-green-50 border-green-200';
    if (type?.includes('alert') || type?.includes('warning')) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">AI Business Insights</h3>
            <p className="text-xs text-slate-500">Personalized recommendations based on your data</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={generateInsights}
          disabled={loading}
          className="gap-1.5 text-xs"
        >
          {loading ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
          ) : generated ? (
            <><RefreshCw className="w-3.5 h-3.5" /> Refresh</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> Generate</>
          )}
        </Button>
      </div>

      {!generated && !loading && (
        <div className="text-center py-6 text-slate-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Click "Generate" to get personalized AI insights for your business.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-6 text-slate-400">
          <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Analyzing your business data...</p>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = typeIcon(insight.type);
            const colorClass = typeColor(insight.type);
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${colorClass}`}>
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{insight.title}</p>
                  <p className="text-xs mt-0.5 opacity-80">{insight.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}