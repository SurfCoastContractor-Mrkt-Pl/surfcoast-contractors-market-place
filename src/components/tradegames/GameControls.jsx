import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function GameControls({ gameMode, isGameSolved, onReset, onGetHint }) {
  return (
    <Card className="p-3 bg-white border border-slate-200">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Controls</p>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
            {gameMode?.replace('_', ' ')}
          </span>
        </div>

        {isGameSolved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-green-700">Puzzle Solved!</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8 border-amber-200 text-amber-700 hover:bg-amber-50"
            onClick={onGetHint}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Get Hint
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8 border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={onReset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}