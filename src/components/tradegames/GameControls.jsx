import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Lightbulb } from 'lucide-react';

export default function GameControls({ gameMode, isGameSolved, onReset, onGetHint }) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Game Mode</p>
          <p className="text-sm text-gray-600 capitalize">{gameMode}</p>
        </div>

        {isGameSolved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-800">✓ Puzzle Solved!</p>
          </div>
        )}

        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={onGetHint}>
            <Lightbulb className="w-4 h-4" />
            Get Hint
          </Button>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}