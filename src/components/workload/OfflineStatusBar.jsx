import React from 'react';
import { Wifi, WifiOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function OfflineStatusBar({
  isOnline,
  isSyncing,
  syncError,
  pendingCount,
  lastSyncTime,
  onRetrySync,
}) {
  if (isOnline && !syncError && pendingCount === 0) {
    return null; // Don't show when everything is fine
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm rounded-lg shadow-lg p-4 z-50 ${
        syncError
          ? 'bg-red-50 border border-red-200'
          : isOnline
          ? 'bg-green-50 border border-green-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {syncError ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : isOnline && pendingCount > 0 && isSyncing ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          ) : isOnline && pendingCount === 0 ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : !isOnline ? (
            <WifiOff className="w-5 h-5 text-yellow-600" />
          ) : (
            <Wifi className="w-5 h-5 text-green-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {syncError ? (
            <>
              <p className="font-semibold text-red-900 text-sm">Sync Error</p>
              <p className="text-red-700 text-xs mt-1">{syncError}</p>
            </>
          ) : !isOnline ? (
            <>
              <p className="font-semibold text-yellow-900 text-sm">You're Offline</p>
              <p className="text-yellow-700 text-xs mt-1">
                Changes will sync when you reconnect.
              </p>
            </>
          ) : isSyncing ? (
            <>
              <p className="font-semibold text-blue-900 text-sm">Syncing Changes...</p>
              <p className="text-blue-700 text-xs mt-1">{pendingCount} change(s) pending</p>
            </>
          ) : pendingCount > 0 ? (
            <>
              <p className="font-semibold text-green-900 text-sm">Online</p>
              <p className="text-green-700 text-xs mt-1">{pendingCount} change(s) synced</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-green-900 text-sm">All Synced</p>
              {lastSyncTime && (
                <p className="text-green-700 text-xs mt-1">
                  Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
                </p>
              )}
            </>
          )}
        </div>

        {/* Retry Button */}
        {syncError && onRetrySync && (
          <button
            onClick={onRetrySync}
            className="flex-shrink-0 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}