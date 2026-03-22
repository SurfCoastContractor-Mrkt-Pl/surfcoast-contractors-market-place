import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function JobsCompletedWidget({ totalJobs, completedJobs, inProgressJobs }) {
  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Jobs Overview</h3>
        <Badge variant="outline">{completionRate}% Complete</Badge>
      </div>

      <div className="space-y-4">
        {/* Completion Rate Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Completion Rate</span>
            <span className="text-sm font-semibold text-slate-900">{completedJobs}/{totalJobs}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
            <p className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3" />
              Completed
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{inProgressJobs}</p>
            <p className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              In Progress
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-600">{totalJobs}</p>
            <p className="text-xs text-slate-600 mt-1">Total</p>
          </div>
        </div>
      </div>
    </Card>
  );
}