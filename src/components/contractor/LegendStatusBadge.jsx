import React from 'react';
import { Award, Lock } from 'lucide-react';

export default function LegendStatusBadge({ jobsCompleted = 0 }) {
  const isLegend = jobsCompleted >= 300;
  const progress = Math.min((jobsCompleted / 300) * 100, 100);

  return (
    <div className={`rounded-xl border-2 p-4 ${
      isLegend
        ? 'border-amber-400 bg-amber-50'
        : 'border-slate-200 bg-slate-50'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        {isLegend ? (
          <>
            <Award className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900">SurfCoast Legend</p>
              <p className="text-xs text-amber-700">Achieved at 300 jobs</p>
            </div>
          </>
        ) : (
          <>
            <Lock className="w-6 h-6 text-slate-400" />
            <div>
              <p className="text-sm font-bold text-slate-800">SurfCoast Legend</p>
              <p className="text-xs text-slate-600">{jobsCompleted}/300 jobs</p>
            </div>
          </>
        )}
      </div>

      {!isLegend && (
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {isLegend && (
        <p className="text-xs text-amber-700 mt-2">
          ✨ You've achieved elite contractor status with {jobsCompleted} verified completed jobs.
        </p>
      )}
    </div>
  );
}