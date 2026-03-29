import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Clock } from 'lucide-react';

export default function GameStatistics({ game }) {
  const avgTime = game.average_completion_time || 0;
  const minutes = Math.floor(avgTime / 60);
  const seconds = avgTime % 60;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Times Played</p>
              <p className="text-2xl font-bold">{game.play_count || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold">{Math.round(game.average_score || 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold">
                {minutes}m {seconds}s
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}