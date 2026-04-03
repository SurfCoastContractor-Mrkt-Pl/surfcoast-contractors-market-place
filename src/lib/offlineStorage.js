// Offline storage utility using IndexedDB for robust local persistence
export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SurfCoastOfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for scope/job data
      if (!db.objectStoreNames.contains('scopes')) {
        const scopeStore = db.createObjectStore('scopes', { keyPath: 'id' });
        scopeStore.createIndex('email', 'contractor_email', { unique: false });
      }

      // Store for offline changes (pending sync)
      if (!db.objectStoreNames.contains('pendingChanges')) {
        db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
      }

      // Store for sync metadata
      if (!db.objectStoreNames.contains('syncMetadata')) {
        db.createObjectStore('syncMetadata', { keyPath: 'key' });
      }
    };
  });
};

export const saveScopsLocally = async (scopes) => {
  const db = await openDatabase();
  const tx = db.transaction('scopes', 'readwrite');
  const store = tx.objectStore('scopes');

  scopes.forEach((scope) => {
    store.put(scope);
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getLocalScopes = async (contractorEmail) => {
  const db = await openDatabase();
  const tx = db.transaction('scopes', 'readonly');
  const store = tx.objectStore('scopes');
  const index = store.index('email');

  return new Promise((resolve, reject) => {
    const request = index.getAll(contractorEmail);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const savePendingChange = async (entityType, entityId, field, newValue, oldValue) => {
  const db = await openDatabase();
  const tx = db.transaction('pendingChanges', 'readwrite');
  const store = tx.objectStore('pendingChanges');

  const change = {
    entityType,
    entityId,
    field,
    newValue,
    oldValue,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  store.add(change);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getPendingChanges = async () => {
  const db = await openDatabase();
  const tx = db.transaction('pendingChanges', 'readonly');
  const store = tx.objectStore('pendingChanges');

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const markChangeAsSynced = async (changeId) => {
  const db = await openDatabase();
  const tx = db.transaction('pendingChanges', 'readwrite');
  const store = tx.objectStore('pendingChanges');

  return new Promise((resolve, reject) => {
    const request = store.get(changeId);
    request.onsuccess = () => {
      const change = request.result;
      if (change) {
        change.synced = true;
        store.put(change);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const clearPendingChanges = async () => {
  const db = await openDatabase();
  const tx = db.transaction('pendingChanges', 'readwrite');
  const store = tx.objectStore('pendingChanges');
  store.clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const saveSyncMetadata = async (key, value) => {
  const db = await openDatabase();
  const tx = db.transaction('syncMetadata', 'readwrite');
  const store = tx.objectStore('syncMetadata');

  store.put({ key, value, timestamp: new Date().toISOString() });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getSyncMetadata = async (key) => {
  const db = await openDatabase();
  const tx = db.transaction('syncMetadata', 'readonly');
  const store = tx.objectStore('syncMetadata');

  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => reject(request.error);
  });
};