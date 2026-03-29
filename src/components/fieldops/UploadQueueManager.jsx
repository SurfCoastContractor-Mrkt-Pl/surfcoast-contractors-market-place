import React from 'react';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function UploadQueueManager({ queue, activeCount }) {
  if (queue.length === 0) return null;

  const getItemStatus = (item) => {
    if (item.completed) return 'completed';
    if (item.error) return 'error';
    if (item.uploading) return 'uploading';
    return 'pending';
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 w-80 max-w-[calc(100vw-32px)]">
      <div className="flex items-center gap-2 mb-3">
        <Upload className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-300">
          Upload Queue ({activeCount}/{queue.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {queue.map((item, idx) => {
          const status = getItemStatus(item);
          return (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg text-xs"
            >
              {status === 'uploading' && (
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
              {status === 'completed' && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
              {status === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              {status === 'pending' && (
                <div className="w-3 h-3 rounded-full bg-slate-600" />
              )}

              <span className="flex-1 text-slate-400 truncate">
                {item.fileName || `File ${idx + 1}`}
              </span>

              {status === 'error' && (
                <button
                  onClick={item.onRetry}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Retry
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Uploads will continue in background
      </p>
    </div>
  );
}