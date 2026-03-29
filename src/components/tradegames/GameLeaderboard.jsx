import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export default function GameLeaderboard({ gameId, difficulty }) {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', gameId, difficulty],
    queryFn: async () => {
      return await base44.entities.GameLeaderboard.filter({
        trade_game_id: gameId,
        ...(difficulty && { difficulty })
      }, '-score', 100);
    }
  });

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard {difficulty && `(${difficulty})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 text-center font-bold text-lg">
                    {getMedalIcon(entry.rank) || `#${entry.rank}`}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{entry.player_name}</p>
                    <p className="text-xs text-gray-500">{entry.player_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-purple-600">{entry.score}</p>
                  <p className="text-xs text-gray-500">{entry.completions} completion{entry.completions !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No scores yet. Be the first to complete this game!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}