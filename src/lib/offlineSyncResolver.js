// Conflict resolution strategy for offline data synchronization
// Handles cases where user modifies data offline and online simultaneously

export const ConflictResolutionStrategies = {
  // Last-write-wins: The most recent change takes precedence
  LAST_WRITE_WINS: 'last_write_wins',
  
  // User-preferred: User's local changes always win
  USER_PREFERRED: 'user_preferred',
  
  // Server-preferred: Server's remote changes always win
  SERVER_PREFERRED: 'server_preferred',
  
  // Merge: Attempt to intelligently merge changes (for objects)
  MERGE: 'merge'
};

export function detectConflict(localData, remoteData, lastSyncTime) {
  const localTimestamp = new Date(localData.updated_date || localData.created_date).getTime();
  const remoteTimestamp = new Date(remoteData.updated_date || remoteData.created_date).getTime();
  const lastSync = new Date(lastSyncTime).getTime();

  const localModifiedSinceSync = localTimestamp > lastSync;
  const remoteModifiedSinceSync = remoteTimestamp > lastSync;

  return {
    hasConflict: localModifiedSinceSync && remoteModifiedSinceSync,
    localNewer: localTimestamp > remoteTimestamp,
    remoteNewer: remoteTimestamp > localTimestamp,
    localTimestamp,
    remoteTimestamp
  };
}

export function resolveConflict(localData, remoteData, strategy = ConflictResolutionStrategies.LAST_WRITE_WINS) {
  const conflict = detectConflict(localData, remoteData, localData._lastSync || new Date(0));

  if (!conflict.hasConflict) {
    return remoteData; // No conflict, use remote
  }

  switch (strategy) {
    case ConflictResolutionStrategies.LAST_WRITE_WINS:
      return conflict.localNewer ? localData : remoteData;

    case ConflictResolutionStrategies.USER_PREFERRED:
      return localData;

    case ConflictResolutionStrategies.SERVER_PREFERRED:
      return remoteData;

    case ConflictResolutionStrategies.MERGE:
      return mergeObjects(localData, remoteData, conflict);

    default:
      console.warn(`Unknown conflict strategy: ${strategy}, falling back to last-write-wins`);
      return conflict.localNewer ? localData : remoteData;
  }
}

function mergeObjects(local, remote, conflict) {
  const merged = { ...remote }; // Start with remote as base

  // For each field in local, decide whether to keep local or remote
  for (const key in local) {
    if (key.startsWith('_')) continue; // Skip internal fields
    if (key === 'id' || key === 'created_date') continue; // Skip immutable fields

    // For primitive values, use last-write-wins
    if (typeof local[key] !== 'object') {
      if (conflict.localNewer) {
        merged[key] = local[key];
      }
    }
    // For arrays, concatenate unique values
    else if (Array.isArray(local[key]) && Array.isArray(remote[key])) {
      const combined = [...new Set([...local[key], ...remote[key]])];
      merged[key] = combined;
    }
    // For nested objects, recursively merge
    else if (typeof local[key] === 'object' && typeof remote[key] === 'object') {
      merged[key] = { ...remote[key], ...local[key] };
    }
  }

  merged._conflicts = {
    detected: true,
    strategy: ConflictResolutionStrategies.MERGE,
    localVersion: conflict.localTimestamp,
    remoteVersion: conflict.remoteTimestamp
  };

  return merged;
}

export function syncWithConflictDetection(localData, remoteData, strategy) {
  const result = resolveConflict(localData, remoteData, strategy);
  return {
    data: result,
    hadConflict: detectConflict(localData, remoteData, localData._lastSync).hasConflict,
    strategy
  };
}