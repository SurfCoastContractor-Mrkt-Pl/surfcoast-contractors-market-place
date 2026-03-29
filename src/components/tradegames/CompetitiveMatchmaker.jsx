import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, Trophy, Send } from 'lucide-react';

export default function CompetitiveMatchmaker({ gameId, gameDifficulty = 'medium', gameTitle }) {
  const [selectedOpponent, setSelectedOpponent] = useState(null);

  // Fetch match recommendations
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['competitiveMatches', gameId, gameDifficulty],
    queryFn: async () => {
      const response = await base44.functions.invoke('recommendCompetitiveMatches', {
        gameId,
        difficulty: gameDifficulty
      });
      return response.data;
    },
    enabled: !!gameId
  });

  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: async (opponentEmail) => {
      const response = await base44.functions.invoke('createCompetitiveMatch', {
        gameId,
        difficulty: gameDifficulty,
        gameTitle,
        opponentEmail
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSelectedOpponent(null);
    }
  });

  if (matchesLoading) {
    return <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>;
  }

  const opponents = matches?.recommendedOpponents || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Find Competitive Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {opponents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No suitable opponents found for this difficulty level.</p>
            <p className="text-sm mt-2">Play more games to unlock competitive matches!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Your average score: <span className="font-bold">{matches.userAvgScore}</span>
            </p>
            {opponents.map((opponent) => (
              <div
                key={opponent.email}
                className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                  selectedOpponent === opponent.email
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
                onClick={() => setSelectedOpponent(opponent.email)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{opponent.name}</p>
                    <div className="flex gap-3 mt-2 text-sm">
                      <span className="text-gray-600">
                        <Zap className="w-4 h-4 inline mr-1" />
                        Avg: {opponent.avgScore}
                      </span>
                      <span className="text-gray-600">
                        <Trophy className="w-4 h-4 inline mr-1" />
                        Best: {opponent.bestScore}
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        Gap: {opponent.skillGap.toFixed(0)} pts
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {selectedOpponent && (
              <Button
                onClick={() => createMatchMutation.mutate(selectedOpponent)}
                disabled={createMatchMutation.isPending}
                className="w-full mt-4 gap-2"
              >
                <Send className="w-4 h-4" />
                {createMatchMutation.isPending ? 'Sending Challenge...' : 'Challenge Selected Player'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}