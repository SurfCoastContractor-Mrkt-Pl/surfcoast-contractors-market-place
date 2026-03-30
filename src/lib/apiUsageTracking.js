// API Usage & Quota Tracking
// Monitors API calls, quotas, and usage patterns

import { base44 } from '@/api/base44Client';

export const API_ENDPOINTS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  FUNCTION: 'function',
  INTEGRATION: 'integration',
  WEBHOOK: 'webhook',
  AUTH: 'auth'
};

class APIUsageTracker {
  constructor() {
    this.calls = [];
    this.quotas = new Map();
    this.isOnline = navigator.onLine;
  }

  // Track an API call
  trackCall(endpoint, method, status, responseTime, metadata = {}) {
    const call = {
      endpoint,
      method,
      status,
      responseTime,
      metadata,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    this.calls.push(call);

    // Auto-flush if too many calls
    if (this.calls.length >= 50) {
      this.flushCalls();
    }

    return call;
  }

  // Set API quota
  setQuota(endpoint, dailyLimit, monthlyLimit) {
    this.quotas.set(endpoint, {
      endpoint,
      dailyLimit,
      monthlyLimit,
      dailyUsed: 0,
      monthlyUsed: 0,
      resetDate: new Date().toISOString()
    });
  }

  // Get quota status
  getQuotaStatus(endpoint) {
    return this.quotas.get(endpoint) || null;
  }

  // Check if quota exceeded
  isQuotaExceeded(endpoint) {
    const quota = this.quotas.get(endpoint);
    if (!quota) return false;

    return quota.dailyUsed >= quota.dailyLimit ||
           quota.monthlyUsed >= quota.monthlyLimit;
  }

  // Get usage statistics
  getStats(timeframe = '24h') {
    const now = new Date();
    let since = new Date();

    if (timeframe === '1h') since.setHours(since.getHours() - 1);
    else if (timeframe === '24h') since.setDate(since.getDate() - 1);
    else if (timeframe === '7d') since.setDate(since.getDate() - 7);
    else if (timeframe === '30d') since.setDate(since.getDate() - 30);

    const filtered = this.calls.filter(call =>
      new Date(call.timestamp) >= since
    );

    const stats = {
      total: filtered.length,
      byEndpoint: {},
      byMethod: {},
      byStatus: {},
      errorCount: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0
    };

    const responseTimes = [];

    for (const call of filtered) {
      // By endpoint
      if (!stats.byEndpoint[call.endpoint]) {
        stats.byEndpoint[call.endpoint] = { count: 0, errors: 0 };
      }
      stats.byEndpoint[call.endpoint].count++;
      if (call.status >= 400) {
        stats.byEndpoint[call.endpoint].errors++;
      }

      // By method
      if (!stats.byMethod[call.method]) {
        stats.byMethod[call.method] = 0;
      }
      stats.byMethod[call.method]++;

      // By status
      if (!stats.byStatus[call.status]) {
        stats.byStatus[call.status] = 0;
      }
      stats.byStatus[call.status]++;

      // Error tracking
      if (call.status >= 400) {
        stats.errorCount++;
      }

      // Response times
      responseTimes.push(call.responseTime);
    }

    // Calculate response time stats
    if (responseTimes.length > 0) {
      stats.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      responseTimes.sort((a, b) => a - b);
      stats.p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)];
      stats.p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)];
    }

    return stats;
  }

  // Flush calls to backend
  async flushCalls() {
    if (this.calls.length === 0) return;

    const callsToSend = [...this.calls];
    this.calls = [];

    try {
      await base44.functions.invoke('logAPIUsage', {
        calls: callsToSend
      });
    } catch (err) {
      console.error('Failed to flush API calls:', err);
      // Re-queue if failed
      this.calls = callsToSend.concat(this.calls);
    }
  }

  cleanup() {
    // Keep only last 1000 calls
    if (this.calls.length > 1000) {
      this.calls = this.calls.slice(-1000);
    }
  }
}

export const apiUsageTracker = new APIUsageTracker();

// Intercept fetch calls (for monitoring API usage)
export function setupAPIInterception() {
  const originalFetch = window.fetch;

  window.fetch = async function(...args) {
    const url = args[0];
    const options = args[1] || {};
    const method = options.method || 'GET';

    const startTime = performance.now();

    try {
      const response = await originalFetch.apply(this, args);
      const duration = performance.now() - startTime;

      // Extract endpoint name
      const endpoint = new URL(url, window.location.origin).pathname;

      apiUsageTracker.trackCall(
        endpoint,
        method,
        response.status,
        Math.round(duration),
        { url }
      );

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      const endpoint = new URL(url, window.location.origin).pathname;

      apiUsageTracker.trackCall(
        endpoint,
        method,
        0, // Error status
        Math.round(duration),
        { url, error: error.message }
      );

      throw error;
    }
  };
}

// Periodic flushing
export function startAPITrackingSchedule(intervalMs = 60000) {
  setInterval(() => {
    apiUsageTracker.flushCalls();
    apiUsageTracker.cleanup();
  }, intervalMs);
}