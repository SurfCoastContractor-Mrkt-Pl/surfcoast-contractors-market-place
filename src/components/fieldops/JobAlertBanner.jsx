import React, { useState } from 'react';
import { AlertCircle, X, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JobAlertBanner({ jobs, onDismiss, onViewJob }) {
  const [expanded, setExpanded] = useState(false);

  if (!jobs || jobs.length === 0) return null;

  const topJob = jobs[0];
  const hasMore = jobs.length > 1;

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-sm font-semibold text-blue-100">
              {jobs.length} new job{jobs.length !== 1 ? 's' : ''} match your skills
            </p>
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-300 hover:text-blue-200 underline"
              >
                {expanded ? 'Hide' : `Show ${jobs.length - 1} more`}
              </button>
            )}
          </div>

          {/* Top Job Preview */}
          <div className="bg-blue-800/50 rounded-lg p-2 mb-2 border border-blue-700">
            <p className="text-sm font-medium text-white mb-1">{topJob.job_title}</p>
            <div className="flex flex-wrap gap-3 text-xs text-blue-200">
              {topJob.cost_amount && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>${topJob.cost_amount.toFixed(0)}</span>
                </div>
              )}
              {topJob.customer_name && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  <span>{topJob.customer_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expanded List */}
          {expanded && jobs.slice(1).map(job => (
            <div key={job.id} className="bg-blue-800/30 rounded-lg p-2 mb-2 border border-blue-700/50">
              <p className="text-sm font-medium text-blue-100 mb-1">{job.job_title}</p>
              <div className="flex items-center gap-1 text-xs text-blue-300">
                <DollarSign className="w-3 h-3" />
                <span>${job.cost_amount?.toFixed(0) || 'Quote'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-500 text-white h-8 text-xs"
            onClick={() => onViewJob(topJob)}
          >
            View
          </Button>
          <button
            onClick={() => onDismiss(topJob.id)}
            className="text-blue-300 hover:text-blue-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}