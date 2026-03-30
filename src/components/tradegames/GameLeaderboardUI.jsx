import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Clock, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function GameLeaderboardUI({ gameId, currentScore, currentTime, onViewFull }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    // Refresh leaderboard every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [gameId]);

  const fetchLeaderboard = async () => {
    try {
      // In a real app, fetch from backend
      // For now, using mock data
      const mockData = [
        { rank: 1, name: 'Alex Chen', score: 485, time: 45, trade: 'Plumbing', moves: 6 },
        { rank: 2, name: 'Jordan Smith', score: 472, time: 52, trade: 'Electrical', moves: 7 },
        { rank: 3, name: 'Casey Kim', score: 458, time: 61, trade: 'Plumbing', moves: 8 },
        { rank: 4, name: 'Morgan Lee', score: 441, time: 78, trade: 'Electrical', moves: 10 },
        { rank: 5, name: 'Pat Williams', score: 428, time: 89, trade: 'Plumbing', moves: 11 },
      ];
      setLeaderboard(mockData);
      setLoading(false);

      // Simulate user rank (in real app, based on actual submission)
      if (currentScore) {
        const rank = mockData.findIndex(entry => entry.score < currentScore) + 1 || mockData.length + 1;
        setUserRank(rank);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTradeColor = (trade) => {
    return trade === 'Plumbing' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900">Leaderboard</h2>
        </div>
        <button
          onClick={onViewFull}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Full →
        </button>
      </div>

      {/* Current User Score Card (if available) */}
      {currentScore !== undefined && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-semibold uppercase">Your Score</p>
              <p className="text-2xl font-bold text-blue-900">{currentScore}</p>
              {userRank && <p className="text-xs text-blue-600 mt-1">Rank: #{userRank}</p>}
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-1 text-blue-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{currentTime}</span>
              </div>
              {currentScore > 400 && (
                <Badge className="bg-amber-500 text-white gap-1">
                  <Flame className="w-3 h-3" />
                  Hot streak!
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No scores yet. Be the first!</div>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
              >
                {/* Rank + Name */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 text-center font-bold text-lg text-slate-700">
                    {getMedalIcon(entry.rank)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{entry.name}</p>
                    <Badge className={getTradeColor(entry.trade)}>
                      {entry.trade}
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-slate-400" />
                    <span>{entry.moves} moves</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{entry.time}s</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right min-w-16">
                  <p className="text-xl font-bold text-amber-600">{entry.score}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Scoring Info */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <p className="font-semibold text-green-900">Speed Bonus</p>
          <p className="text-green-700">Faster = More points</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <p className="font-semibold text-blue-900">Accuracy Matters</p>
          <p className="text-blue-700">Fewer errors = Higher score</p>
        </div>
      </div>
    </div>
  );
}