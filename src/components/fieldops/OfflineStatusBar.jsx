import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export default function OfflineStatusBar({ isOnline, pendingCount = 0, onSync }) {
  const [syncing, setSyncing] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      setJustCameOnline(true);
      const t = setTimeout(() => setJustCameOnline(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isOnline]);

  const handleSync = async () => {
    if (!onSync || syncing) return;
    setSyncing(true);
    await onSync();
    setSyncing(false);
  };

  if (isOnline && !justCameOnline) return null;

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-sm font-semibold ${
      isOnline
        ? 'bg-green-600 text-white'
        : 'bg-red-600 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {isOnline
          ? <Wifi className="w-4 h-4" />
          : <WifiOff className="w-4 h-4" />
        }
        <span>
          {isOnline
            ? pendingCount > 0 ? `Back online — ${pendingCount} item(s) ready to sync` : 'Back online'
            : 'Offline — job data cached locally'
          }
        </span>
      </div>
      {isOnline && pendingCount > 0 && onSync && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-bold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      )}
    </div>
  );
}