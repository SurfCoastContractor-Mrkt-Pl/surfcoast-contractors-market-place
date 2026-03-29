import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Clock, TrendingUp } from 'lucide-react';

export default function LiveScoringDashboard({ matchId }) {
  const [liveScores, setLiveScores] = useState(null);

  // Fetch match details
  const { data: match, isLoading } = useQuery({
    queryKey: ['liveMatch', matchId],
    queryFn: async () => {
      const m = await base44.entities.GameCompetitiveMatch.get(matchId);
      return m;
    },
    refetchInterval: 2000, // Poll every 2 seconds for live updates
    enabled: !!matchId
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = base44.entities.GameCompetitiveMatch.subscribe((event) => {
      if (event.id === matchId) {
        setLiveScores(event.data);
      }
    });

    return unsubscribe;
  }, [matchId]);

  const currentMatch = liveScores || match;

  if (isLoading || !currentMatch) {
    return <div className="p-8 text-center">Loading match...</div>;
  }

  const isCompleted = currentMatch.status === 'completed';
  const initiatorLeads = (currentMatch.initiator_score || 0) > (currentMatch.opponent_score || 0);

  return (
    <div className="w-full space-y-4">
      {/* Match Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{currentMatch.game_title}</h2>
            <Badge className={isCompleted ? 'bg-green-500' : 'bg-blue-500'}>
              {isCompleted ? 'Completed' : 'Live'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Difficulty: <span className="font-semibold capitalize">{currentMatch.difficulty}</span>
          </p>
        </CardContent>
      </Card>

      {/* Score Board */}
      <div className="grid grid-cols-2 gap-4">
        {/* Initiator Score */}
        <Card className={`${initiatorLeads ? 'border-2 border-yellow-400' : ''}`}>
          <CardHeader>
            <CardTitle className="text-sm">
              {currentMatch.challenge_initiator_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-blue-600">
                  {currentMatch.initiator_score || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">Initiator</p>
              </div>
              {initiatorLeads && (
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Opponent Score */}
        <Card className={`${!initiatorLeads && currentMatch.opponent_score > 0 ? 'border-2 border-yellow-400' : ''}`}>
          <CardHeader>
            <CardTitle className="text-sm">
              {currentMatch.opponent_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-purple-600">
                  {currentMatch.opponent_score || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">Opponent</p>
              </div>
              {!initiatorLeads && currentMatch.opponent_score > 0 && (
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Stats */}
      {isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Match Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Winner:</span>
              <Badge className="bg-green-500">
                {currentMatch.winner_email === currentMatch.challenge_initiator_email
                  ? currentMatch.challenge_initiator_name
                  : currentMatch.opponent_name}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.floor((currentMatch.match_duration_seconds || 0) / 60)}m
                {(currentMatch.match_duration_seconds || 0) % 60}s
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Initiator Prize:</span>
              <span className="font-semibold text-blue-600">
                ${currentMatch.initiator_prize_earned || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Opponent Prize:</span>
              <span className="font-semibold text-purple-600">
                ${currentMatch.opponent_prize_earned || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}