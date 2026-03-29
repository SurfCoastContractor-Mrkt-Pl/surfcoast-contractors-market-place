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

  const getRecommendations = async (jobId) => {
    setLoading(true);
    setRecommendations(null);
    try {
      const response = await base44.functions.invoke('aiSchedulingAssistant', {
        job_id: jobId
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">AI Scheduling Assistant</h1>
          </div>
          <p className="text-slate-600">Get smart scheduling recommendations powered by AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Open Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {openJobs.length === 0 ? (
                  <p className="text-slate-600 text-sm">No open jobs available</p>
                ) : (
                  openJobs.map(job => (
                    <Button
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job);
                        getRecommendations(job.id);
                      }}
                      variant={selectedJob?.id === job.id ? 'default' : 'outline'}
                      className="w-full justify-start text-left h-auto py-2 px-3"
                    >
                      <div className="text-sm">
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-xs opacity-70">{job.location}</p>
                      </div>
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2">
            {!selectedJob ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  Select a job to get AI scheduling recommendations
                </CardContent>
              </Card>
            ) : loading ? (
              <Card>
                <CardContent className="pt-6 flex items-center justify-center gap-3 text-slate-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing job and your availability...
                </CardContent>
              </Card>
            ) : recommendations ? (
              <div className="space-y-4">
                {recommendations.travelWarning && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-6 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <p className="text-orange-900 text-sm">{recommendations.travelWarning}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  {recommendations.recommendations?.map((rec, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <p className="font-semibold">
                                {format(new Date(rec.date), 'EEE, MMM d, yyyy')}
                              </p>
                              <Badge variant="outline">{rec.startTime} - {rec.endTime}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 text-center">{rec.reason}</p>
                          </div>
                          <Button className="gap-2">
                            Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {recommendations.constraints?.length > 0 && (
                  <Card className="bg-slate-100">
                    <CardContent className="pt-6">
                      <p className="text-sm font-semibold text-slate-900 mb-2">Scheduling Constraints:</p>
                      <ul className="space-y-1">
                        {recommendations.constraints.map((c, i) => (
                          <li key={i} className="text-sm text-slate-700">• {c}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}