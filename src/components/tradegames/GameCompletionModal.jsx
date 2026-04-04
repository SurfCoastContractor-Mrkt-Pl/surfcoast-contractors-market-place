import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target } from 'lucide-react';

export default function GameCompletionModal({ score, discount, onClose, onPlayAgain }) {
  const performance = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Passed' : 'Keep Trying';
  const stars = score >= 80 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
          <Trophy className="w-14 h-14 mx-auto mb-3 text-yellow-300" />
          <h2 className="text-2xl font-extrabold mb-1">Challenge Complete!</h2>
          <p className="text-blue-200 text-sm">{performance}</p>
          <div className="flex justify-center gap-1 mt-3">
            {[1, 2, 3].map(i => (
              <Star
                key={i}
                className={`w-7 h-7 ${i <= stars ? 'text-yellow-300 fill-yellow-300' : 'text-blue-400'}`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-2xl font-bold text-slate-900">{score}</p>
              <p className="text-xs text-slate-500">Score</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Zap className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-bold text-green-700">{discount}%</p>
              <p className="text-xs text-slate-500">Discount Earned</p>
            </div>
          </div>

          {discount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
              <p className="text-sm text-orange-800 font-medium">
                🎉 You've earned a <strong>{discount}% discount</strong> on your next quote!
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onPlayAgain}>
              Play Again
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}