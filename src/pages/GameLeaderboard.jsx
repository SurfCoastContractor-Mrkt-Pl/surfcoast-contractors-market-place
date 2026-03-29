import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, Target } from 'lucide-react';

export default function GameLeaderboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  // Fetch game details
  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      if (!gameId) return null;
      return await base44.entities.TradeGame.get(gameId);
    },
    enabled: !!gameId
  });

  // Fetch leaderboard entries
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard', gameId, selectedDifficulty],
    queryFn: async () => {
      if (!gameId) return [];
      const entries = await base44.entities.GameLeaderboard.filter(
        {
          trade_game_id: gameId,
          difficulty: selectedDifficulty
        },
        'rank',
        100
      );
      return entries;
    },
    enabled: !!gameId
  });

  if (!gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">No Game Selected</h1>
            <p className="text-slate-600 mb-6">Please select a game to view its leaderboard.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">
            Back to Games
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Leaderboard</h1>
          {game && <p className="text-lg text-slate-600">{game.title}</p>}
        </div>

        {/* Difficulty Selector */}
        <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty} className="mb-8">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Scores - {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">No scores yet for this difficulty.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr className="text-left text-slate-600 font-semibold">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Score</th>
                      <th className="py-3 px-4 text-right">Time</th>
                      <th className="py-3 px-4 text-right">Completions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {leaderboard.map((entry, idx) => (
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          idx < 3 ? 'bg-slate-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {idx === 0 && <span className="text-2xl">🥇</span>}
                            {idx === 1 && <span className="text-2xl">🥈</span>}
                            {idx === 2 && <span className="text-2xl">🥉</span>}
                            {idx >= 3 && (
                              <span className="font-semibold text-slate-700 w-8">{entry.rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900">{entry.player_name}</span>
                          <p className="text-xs text-slate-500">{entry.player_email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {entry.player_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-slate-900">{entry.score}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Clock className="w-4 h-4 text-slate-600" />
                            <span className="text-slate-700">
                              {Math.floor(entry.completion_time / 60)}m {entry.completion_time % 60}s
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-slate-900">{entry.completions}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Footer */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>Last updated: {game?.updated_at ? new Date(game.updated_at).toLocaleString() : 'Unknown'}</p>
        </div>
      </div>
    </div>
  );
}