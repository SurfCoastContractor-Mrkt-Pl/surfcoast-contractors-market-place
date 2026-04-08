import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AISchedulingAssistant() {
  const [user, setUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: openJobs = [] } = useQuery({
    queryKey: ['openJobs', user?.email],
    queryFn: () => user?.email ? 
      base44.entities.Job.filter({ status: 'open' }) : 
      [],
    enabled: !!user?.email
  });

  const getRecommendations = async () => {
    setLoading(true);
    setRecommendations(null);
    try {
      const response = await base44.functions.invoke('aiSchedulingAssistant', {
        contractor_email: user.email
      });
      setRecommendations(response?.data);
    } catch (error) {
      console.error('AI request failed:', error);
    }
    setLoading(false);
  };

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Sparkles className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">AI Scheduling Assistant</h1>
            </div>
            <p className="text-slate-600 text-sm">Analyzes your approved jobs and availability to recommend the optimal week</p>
          </div>
          <Button onClick={getRecommendations} disabled={loading} className="gap-2 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Analyze My Schedule'}
          </Button>
        </div>

        {/* Results */}
        {loading && (
          <Card>
            <CardContent className="py-12 flex items-center justify-center gap-3 text-slate-600">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>AI is analyzing your jobs and availability...</span>
            </CardContent>
          </Card>
        )}

        {!loading && recommendations && (
          <div className="space-y-4">
            {/* Summary + Efficiency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-slate-700 mb-1">AI Summary</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{recommendations.summary || 'No summary available.'}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-5">
                  <p className="text-xs text-slate-500 mb-1">Efficiency Score</p>
                  <p className={`text-4xl font-bold ${
                    (recommendations.efficiencyScore || 0) >= 70 ? 'text-green-600' :
                    (recommendations.efficiencyScore || 0) >= 40 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {recommendations.efficiencyScore ?? '—'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">out of 100</p>
                </CardContent>
              </Card>
            </div>

            {/* Travel Warning */}
            {recommendations.travelWarning && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-orange-900 text-sm">{recommendations.travelWarning}</p>
                </CardContent>
              </Card>
            )}

            {/* Conflicts */}
            {recommendations.conflicts?.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <p className="text-sm font-semibold text-red-800 mb-2">⚠ Scheduling Conflicts</p>
                  <ul className="space-y-1">
                    {recommendations.conflicts.map((c, i) => (
                      <li key={i} className="text-sm text-red-700">• {c}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommended Schedule */}
            {recommendations.recommendations?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommended Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                      <div className="text-center min-w-[60px]">
                        <p className="text-xs text-slate-500">{rec.date ? format(new Date(rec.date), 'EEE') : ''}</p>
                        <p className="text-sm font-bold text-slate-800">{rec.date ? format(new Date(rec.date), 'MMM d') : '—'}</p>
                        <Badge variant="outline" className="text-xs mt-1">{rec.startTime}</Badge>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{rec.jobTitle || 'Job'}</p>
                        {rec.clientName && <p className="text-xs text-slate-500">Client: {rec.clientName}</p>}
                        <p className="text-xs text-slate-600 mt-1">{rec.reason}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            {recommendations.tips?.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">💡 Optimization Tips</p>
                  <ul className="space-y-1">
                    {recommendations.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-blue-800">• {tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!loading && !recommendations && (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Ready to optimize your schedule</p>
              <p className="text-slate-400 text-sm mt-1">Click "Analyze My Schedule" to get AI-powered recommendations based on your approved jobs and availability.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}