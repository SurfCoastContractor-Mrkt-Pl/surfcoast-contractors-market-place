import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, AlertTriangle, Target, Loader2 } from 'lucide-react';

export default function PredictiveAnalyticsDashboard({ userId, userType }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const result = await base44.entities.PredictiveAnalytics.filter({
          subject_id: userId,
        });
        setPredictions(result || []);
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchPredictions();
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        AI-Powered Insights
      </h3>

      {predictions.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No predictions available yet</p>
      ) : (
        predictions.map((pred, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 capitalize">
                  {pred.metric_type.replace('_', ' ')}
                </h4>
                <p className="text-sm text-gray-600">{pred.prediction.recommendation}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{pred.prediction.score}%</div>
                <p className="text-xs text-gray-500">
                  {(pred.prediction.confidence * 100).toFixed(0)}% confidence
                </p>
              </div>
            </div>

            {/* Risk indicator */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    pred.prediction.score > 70
                      ? 'bg-red-600'
                      : pred.prediction.score > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${pred.prediction.score}%` }}
                />
              </div>
            </div>

            {/* Factors */}
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-700">Key Factors:</p>
              {pred.prediction.factors.map((factor, i) => (
                <p key={i} className="text-gray-600 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {factor}
                </p>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}