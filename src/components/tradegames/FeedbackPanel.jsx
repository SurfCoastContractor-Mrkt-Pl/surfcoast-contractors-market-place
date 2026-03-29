import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Info, Lightbulb } from 'lucide-react';

export default function FeedbackPanel({ feedback, score, moveCount }) {
  const getFeedbackIcon = () => {
    if (!feedback) return null;
    switch (feedback.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'hint':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getFeedbackColor = () => {
    if (!feedback) return 'bg-gray-50';
    switch (feedback.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'hint':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card className="p-4 space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-100 rounded p-2">
          <p className="text-xs text-gray-600">Score</p>
          <p className="text-lg font-bold text-gray-900">{score}</p>
        </div>
        <div className="bg-gray-100 rounded p-2">
          <p className="text-xs text-gray-600">Moves</p>
          <p className="text-lg font-bold text-gray-900">{moveCount}</p>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`border rounded-lg p-3 flex gap-2 ${getFeedbackColor()}`}>
          {getFeedbackIcon()}
          <p className="text-sm text-gray-800">{feedback.message}</p>
        </div>
      )}
    </Card>
  );
}