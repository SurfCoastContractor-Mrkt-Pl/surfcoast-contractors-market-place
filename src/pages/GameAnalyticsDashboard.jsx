import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Zap, Trophy } from 'lucide-react';

export default function GameAnalyticsDashboard() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Fetch all game sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['allGameSessions'],
    queryFn: async () => {
      const results = await base44.entities.UserGameSession.list('-created_date', 1000);
      return results;
    }
  });

  // Fetch all games
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['allTradeGames'],
    queryFn: async () => {
      const results = await base44.entities.TradeGame.filter({ is_published: true });
      return results;
    }
  });

  const isLoading = sessionsLoading || gamesLoading;

  // Calculate metrics
  const filteredSessions = selectedDifficulty === 'all'
    ? sessions
    : sessions.filter(s => s.difficulty_level === selectedDifficulty);

  const totalCompletions = filteredSessions.filter(s => s.is_solved).length;
  const totalPlayers = new Set(filteredSessions.map(s => s.user_email)).size;
  const avgScore = filteredSessions.length > 0
    ? Math.round(filteredSessions.reduce((sum, s) => sum + (s.score || 0), 0) / filteredSessions.length)
    : 0;
  const avgTime = filteredSessions.length > 0
    ? Math.round(filteredSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / filteredSessions.length)
    : 0;

  // Completion by game
  const gameCompletions = {};
  filteredSessions.forEach(s => {
    if (s.is_solved) {
      gameCompletions[s.trade_game_id] = (gameCompletions[s.trade_game_id] || 0) + 1;
    }
  });

  const gameChartData = games
    .filter(g => gameCompletions[g.id])
    .map(g => ({
      name: g.title,
      completions: gameCompletions[g.id],
      avgScore: Math.round(
        filteredSessions
          .filter(s => s.trade_game_id === g.id && s.is_solved)
          .reduce((sum, s) => sum + s.score, 0) / gameCompletions[g.id]
      )
    }));

  // Score distribution
  const scoreRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  filteredSessions.forEach(s => {
    if (s.score <= 20) scoreRanges['0-20']++;
    else if (s.score <= 40) scoreRanges['21-40']++;
    else if (s.score <= 60) scoreRanges['41-60']++;
    else if (s.score <= 80) scoreRanges['61-80']++;
    else scoreRanges['81-100']++;
  });

  const scoreData = Object.entries(scoreRanges).map(([range, count]) => ({
    name: range,
    value: count
  }));

  // Completion trend (last 30 days)
  const now = new Date();
  const completionTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const count = filteredSessions.filter(s => {
      const sDate = s.start_time?.split('T')[0];
      return sDate === dateStr && s.is_solved;
    }).length;
    return {
      date: dateStr.slice(5),
      completions: count
    };
  });

  if (isLoading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Game Analytics Dashboard</h1>

        {/* Difficulty Filter */}
        <div className="mb-6 flex gap-2">
          {['all', 'easy', 'medium', 'hard'].map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedDifficulty === diff
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {diff.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Completions</p>
                  <p className="text-3xl font-bold">{totalCompletions}</p>
                </div>
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unique Players</p>
                  <p className="text-3xl font-bold">{totalPlayers}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold">{avgScore}</p>
                </div>
                <Zap className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Time (sec)</p>
                  <p className="text-3xl font-bold">{avgTime}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Completion Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Completion Trend (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completions" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={entry => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'].map((color, idx) => (
                      <Cell key={`cell-${idx}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Completions by Game */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Completions by Game</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gameChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completions" fill="#3b82f6" />
                  <Bar dataKey="avgScore" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}