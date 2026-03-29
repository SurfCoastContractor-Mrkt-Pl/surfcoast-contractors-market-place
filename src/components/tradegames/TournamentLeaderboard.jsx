import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal } from 'lucide-react';

export default function TournamentLeaderboard({ tournamentId }) {
  const [selectedTier, setSelectedTier] = useState('all');

  // Fetch tournament
  const { data: tournament, isLoading: tournamentLoading } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: async () => base44.entities.SeasonalTournament.get(tournamentId),
    enabled: !!tournamentId
  });

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['tournamentLeaderboard', tournamentId],
    queryFn: async () => {
      const results = await base44.entities.TournamentLeaderboard.filter(
        { tournament_id: tournamentId },
        'rank',
        1000
      );
      return results;
    },
    enabled: !!tournamentId,
    refetchInterval: 10000
  });

  if (tournamentLoading || leaderboardLoading) {
    return <div className="p-8 text-center">Loading tournament...</div>;
  }

  const filteredLeaderboard = selectedTier === 'all'
    ? leaderboard
    : leaderboard.filter(entry => entry.player_tier === selectedTier);

  const topThree = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);

  const medalIcons = {
    1: <Trophy className="w-6 h-6 text-yellow-500" />,
    2: <Medal className="w-6 h-6 text-gray-400" />,
    3: <Medal className="w-6 h-6 text-orange-600" />
  };

  return (
    <div className="w-full space-y-6">
      {/* Tournament Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">{tournament?.name}</h1>
            <p className="text-gray-600 mt-2">{tournament?.description}</p>
            <div className="flex gap-6 justify-center mt-4">
              <div>
                <p className="text-sm text-gray-600">Prize Pool</p>
                <p className="text-2xl font-bold text-green-600">${tournament?.total_prize_pool || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={tournament?.status === 'active' ? 'bg-green-500' : 'bg-blue-500'}>
                  {tournament?.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-2xl font-bold">{filteredLeaderboard.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Filter */}
      <div className="flex gap-2 justify-center">
        {['all', 'bronze', 'silver', 'gold', 'platinum'].map(tier => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedTier === tier
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
            }`}
          >
            {tier === 'all' ? 'All Tiers' : tier.charAt(0).toUpperCase() + tier.slice(1)}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {topThree.map((entry, idx) => (
            <Card key={entry.id} className="border-2 border-yellow-300 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    {medalIcons[entry.rank]}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">#{entry.rank}</p>
                    <p className="font-semibold">{entry.player_name}</p>
                  </div>
                  <div className="bg-white rounded p-3 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-lg text-purple-600">{entry.total_score}</span> pts
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.games_completed} games
                    </p>
                  </div>
                  <div className="bg-green-100 rounded p-2">
                    <p className="font-bold text-green-700">
                      ${entry.prize_earned}
                    </p>
                  </div>
                  {entry.player_tier && (
                    <Badge className="capitalize">{entry.player_tier}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Leaderboard */}
      {rest.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rest.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <p className="text-2xl font-bold text-gray-400 w-12">
                      #{entry.rank}
                    </p>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.player_name}</p>
                      <p className="text-sm text-gray-600">
                        {entry.games_completed} games • {entry.average_score} avg score
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-600">{entry.total_score}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                    <div className="text-right min-w-20">
                      <p className="text-lg font-bold text-green-600">${entry.prize_earned}</p>
                      <p className="text-xs text-gray-500">prize</p>
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