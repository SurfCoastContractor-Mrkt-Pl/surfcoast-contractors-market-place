import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProfileCompletionBar() {
  const [completion, setCompletion] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletion();
  }, []);

  const fetchCompletion = async () => {
    try {
      const res = await base44.functions.invoke('getProfileCompletionStatus', {});
      if (res.data.completionStatus) {
        setCompletion(res.data.completionStatus);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile completion:', error);
      setLoading(false);
    }
  };

  if (loading || !completion || completion.isComplete || dismissed) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900 text-sm">
            Complete Your Profile ({completion.percentComplete}%)
          </p>
          <p className="text-blue-700 text-xs mt-1">
            Add {completion.remainingFields.length} missing field{completion.remainingFields.length !== 1 ? 's' : ''} to improve visibility
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${completion.percentComplete}%` }}
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-blue-400 hover:text-blue-600 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}