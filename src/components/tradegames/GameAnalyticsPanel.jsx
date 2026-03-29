import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award } from 'lucide-react';

export default function GameAnalyticsPanel() {
  const [selectedGame, setSelectedGame] = useState(null);

  // Fetch analytics
  const { data: analyticsData = [] } = useQuery({
    queryKey: ['gameAnalytics'],
    queryFn: async () => {
      const response = await base44.functions.invoke('aggregateGameAnalytics', {});
      return response.data?.analytics || [];
    },
    refetchInterval: 30000
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['gameAchievements'],
    queryFn: async () => {
      return await base44.entities.GameAchievement.filter({}, '-earned_at', 100);
    }
  });

  // Calculate achievements mutation
  const achievementsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('calculateGameAchievements', {});
      return response.data;
    }
  });



  // Summary stats
  const totalGames = analyticsData.length;
  const totalSessions = analyticsData.reduce((sum, g) => sum + g.total_sessions, 0);
  const totalCompleted = analyticsData.reduce((sum, g) => sum + g.completed_sessions, 0);
  const avgCompletion = totalSessions > 0 ? Math.round((totalCompleted / totalSessions) * 100) : 0;
  const avgScore = analyticsData.length > 0
    ? Math.round(analyticsData.reduce((sum, g) => sum + g.avg_score, 0) / analyticsData.length)
    : 0;

  // Completion rate by game for chart
  const completionChartData = analyticsData.map(g => ({
    name: g.game_title.substring(0, 12),
    completion: g.completion_rate,
    fullName: g.game_title
  }));

  // Score trend (simulated)
  const scoreTrendData = analyticsData.map(g => ({
    name: g.game_title.substring(0, 12),
    score: g.avg_score,
    best: g.best_score,
    fullName: g.game_title
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Games Played</p>
            <p className="text-3xl font-bold text-purple-600">{totalGames}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Sessions</p>
            <p className="text-3xl font-bold text-blue-600">{totalSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-3xl font-bold text-green-600">{avgCompletion}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Score</p>
            <p className="text-3xl font-bold text-orange-600">{avgScore}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Completion Rate by Game */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completion Rate by Game</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average vs Best Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8B5CF6" name="Avg Score" />
                <Line type="monotone" dataKey="best" stroke="#10B981" name="Best Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Achievements ({achievements.length})
            </CardTitle>
            <Button
              onClick={() => achievementsMutation.mutate()}
              size="sm"
              variant="outline"
            >
              Recalculate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {achievements.length > 0 ? (
              achievements.slice(0, 8).map(achievement => (
                <div key={achievement.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-2xl mb-1">{achievement.icon_emoji}</p>
                  <p className="font-semibold text-sm">{achievement.achievement_name}</p>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={
                      achievement.rarity === 'legendary' ? 'bg-yellow-500' :
                      achievement.rarity === 'epic' ? 'bg-purple-500' :
                      achievement.rarity === 'rare' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }>
                      {achievement.rarity}
                    </Badge>
                    <span className="text-xs text-orange-600 font-semibold">+{achievement.points_awarded} pts</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2 text-center py-8">No achievements yet. Keep playing!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Game Stats */}
      {totalGames > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detailed Game Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.map(game => (
                <div
                  key={game.trade_game_id}
                  onClick={() => setSelectedGame(game.trade_game_id)}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    selectedGame === game.trade_game_id
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{game.game_title}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-600">
                        <span>Sessions: {game.total_sessions}</span>
                        <span>Completed: {game.completed_sessions}</span>
                        <span>Avg Score: {game.avg_score}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{game.completion_rate}%</p>
                      <p className="text-xs text-gray-600">completion</p>
                    </div>
                  </div>
                  
                  {selectedGame === game.trade_game_id && (
                    <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best Score:</span>
                        <span className="font-semibold text-green-600">{game.best_score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consistency:</span>
                        <span className="font-semibold text-blue-600">{game.consistency_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Improvement:</span>
                        <span className="font-semibold text-orange-600">{game.improvement_rate > 0 ? '+' : ''}{game.improvement_rate}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}