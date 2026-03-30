import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Info, Lightbulb, Zap } from 'lucide-react';

const TYPE_CONFIG = {
  success: { icon: CheckCircle, bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon_color: 'text-green-600' },
  error: { icon: AlertCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon_color: 'text-red-500' },
  hint: { icon: Lightbulb, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon_color: 'text-amber-500' },
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon_color: 'text-blue-500' },
};

export default function FeedbackPanel({ feedback, score, moveCount, combo = 0 }) {
  const cfg = feedback ? (TYPE_CONFIG[feedback.type] || TYPE_CONFIG.info) : null;
  const Icon = cfg?.icon;

  return (
    <Card className="p-3 bg-white border border-slate-200">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 text-center">
          <p className="text-xs text-blue-500 font-medium">Score</p>
          <p className="text-lg font-bold text-blue-800 leading-none mt-0.5">{score}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 font-medium">Moves</p>
          <p className="text-lg font-bold text-slate-700 leading-none mt-0.5">{moveCount}</p>
        </div>
        <div className={`rounded-lg p-2 text-center transition-all ${combo > 0 ? 'bg-orange-100' : 'bg-slate-50'}`}>
          <p className={`text-xs font-medium ${combo > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
            Combo
          </p>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            {combo > 1 && <Zap className="w-3 h-3 text-orange-500" />}
            <p className={`text-lg font-bold leading-none ${combo > 0 ? 'text-orange-700' : 'text-slate-300'}`}>
              x{combo}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback message */}
      {feedback && cfg && (
        <div className={`border rounded-lg p-2.5 flex gap-2 items-start ${cfg.bg}`}>
          <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.icon_color}`} />
          <p className={`text-xs leading-relaxed ${cfg.text}`}>{feedback.message}</p>
        </div>
      )}

      {!feedback && (
        <div className="border border-dashed border-slate-200 rounded-lg p-2.5 text-center">
          <p className="text-xs text-slate-400">Place a part to see feedback.</p>
        </div>
      )}
    </Card>
  );
}