import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Calendar } from 'lucide-react';

export default function SeasonalTournamentCard({ tournament, onViewDetails }) {
  const isActive = tournament.status === 'active';
  const daysRemaining = Math.ceil(
    (new Date(tournament.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={`${isActive ? 'border-2 border-purple-500' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {tournament.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{tournament.description}</p>
          </div>
          <Badge className={isActive ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}>
            {tournament.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Prize Pool</p>
            <p className="text-xl font-bold text-green-600">${tournament.total_prize_pool}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Games Required</p>
            <p className="text-xl font-bold text-blue-600">{tournament.min_games_required}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-semibold">Prize Distribution:</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {tournament.prize_distribution &&
              Object.entries(tournament.prize_distribution)
                .slice(0, 3)
                .map(([rank, prize]) => (
                  <div key={rank} className="bg-gray-50 rounded p-2 text-center">
                    <p className="font-semibold">#{rank}</p>
                    <p className="text-green-600 font-bold">${prize}</p>
                  </div>
                ))}
          </div>
        </div>

        <Button
          onClick={() => onViewDetails(tournament.id)}
          className="w-full gap-2"
        >
          <Zap className="w-4 h-4" />
          View Leaderboard
        </Button>
      </CardContent>
    </Card>
  );
}