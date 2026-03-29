import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, Target, Zap, Loader2 } from 'lucide-react';

export default function AITutoringPanel({ gameId, onRecommendationsReady }) {
  const [tutorSession, setTutorSession] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing tutoring session
  const { data: existingSession } = useQuery({
    queryKey: ['tutorSession', gameId],
    queryFn: async () => {
      const sessions = await base44.entities.AITutoringSession.filter({
        trade_game_id: gameId
      });
      return sessions[0] || null;
    },
    enabled: !!gameId
  });

  // Generate recommendations mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await base44.functions.invoke('generateGameRecommendations', {
        gameId
      });
      return response.data;
    },
    onSuccess: (data) => {
      setTutorSession(data);
      onRecommendationsReady?.(data);
      setLoading(false);
    },
    onError: (error) => {
      console.error('Error generating recommendations:', error);
      setLoading(false);
    }
  });

  const session = tutorSession || existingSession;

  if (loading) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <p className="text-blue-700 font-medium">AI is analyzing your performance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI Tutoring & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Get personalized game recommendations based on your performance analysis. Our AI will identify your weak areas and suggest games to help you improve.
          </p>
          <Button
            onClick={() => generateMutation.mutate()}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="w-4 h-4" />
            Generate My Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Analysis */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">{session.analysis}</p>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      {session.focusAreas && session.focusAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {session.focusAreas.map(area => (
                <Badge key={area} className="bg-red-100 text-red-800">
                  {area.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Games */}
      {session.recommendations && session.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Recommended Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {session.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{rec.game_title}</p>
                      <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge className="bg-green-100 text-green-800">
                        Priority {rec.priority}/5
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}