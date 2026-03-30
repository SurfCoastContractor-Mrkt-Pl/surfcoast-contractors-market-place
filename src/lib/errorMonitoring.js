// Error Monitoring Utilities
// Centralized error tracking and logging system

import { base44 } from '@/api/base44Client';

export const ERROR_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

export const ERROR_CATEGORIES = {
  AUTH: 'auth',
  VALIDATION: 'validation',
  NETWORK: 'network',
  DATABASE: 'database',
  PAYMENT: 'payment',
  FILE_UPLOAD: 'file_upload',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
};

class ErrorMonitor {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', () => { this.isOnline = true; this.flushQueue(); });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  async logError({
    message,
    level = ERROR_LEVELS.ERROR,
    category = ERROR_CATEGORIES.UNKNOWN,
    error,
    context = {},
    userId = null
  }) {
    try {
      const errorData = {
        message,
        level,
        category,
        stack: error?.stack || '',
        context,
        userId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      // Try to log to backend if online
      if (this.isOnline) {
        try {
          await base44.functions.invoke('logErrorEvent', errorData);
        } catch (err) {
          console.error('Failed to log error to backend:', err);
          this.queue.push(errorData);
        }
      } else {
        // Queue for later if offline
        this.queue.push(errorData);
        this.saveQueueToLocalStorage();
      }

      // Also log to console in dev
      if (import.meta.env.DEV) {
        console.error(`[${level.toUpperCase()}] ${category}:`, message, error, context);
      }
    } catch (err) {
      console.error('Error in errorMonitor.logError:', err);
    }
  }

  async flushQueue() {
    if (this.queue.length === 0) return;

    const itemsToSend = [...this.queue];
    this.queue = [];

    for (const item of itemsToSend) {
      try {
        await base44.functions.invoke('logErrorEvent', item);
      } catch (err) {
        this.queue.push(item);
      }
    }

    if (this.queue.length === 0) {
      localStorage.removeItem('errorMonitorQueue');
    } else {
      this.saveQueueToLocalStorage();
    }
  }

  saveQueueToLocalStorage() {
    try {
      localStorage.setItem('errorMonitorQueue', JSON.stringify(this.queue));
    } catch {}
  }

  loadQueueFromLocalStorage() {
    try {
      const saved = localStorage.getItem('errorMonitorQueue');
      if (saved) {
        this.queue = JSON.parse(saved);
        this.flushQueue();
      }
    } catch {}
  }
}

export const errorMonitor = new ErrorMonitor();

// Initialize on app load
if (typeof window !== 'undefined') {
  errorMonitor.loadQueueFromLocalStorage();
}

// Global error handler
export function setupGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    errorMonitor.logError({
      message: event.message,
      level: ERROR_LEVELS.ERROR,
      category: ERROR_CATEGORIES.UNKNOWN,
      error: event.error,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorMonitor.logError({
      message: event.reason?.message || 'Unhandled Promise Rejection',
      level: ERROR_LEVELS.ERROR,
      category: ERROR_CATEGORIES.UNKNOWN,
      error: event.reason,
      context: { type: 'unhandledRejection' }
    });
  });
}