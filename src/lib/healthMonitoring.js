// System Health & Uptime Monitoring
// Tracks system health, availability, and dependency status

import { base44 } from '@/api/base44Client';

export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  UNKNOWN: 'unknown'
};

export const CHECK_TYPES = {
  DATABASE: 'database',
  API: 'api',
  FUNCTION: 'function',
  EXTERNAL_SERVICE: 'external_service',
  STORAGE: 'storage',
  AUTHENTICATION: 'authentication',
  PAYMENT_GATEWAY: 'payment_gateway'
};

class HealthMonitor {
  constructor() {
    this.checks = new Map();
    this.results = [];
  }

  registerCheck(id, checkFn, options = {}) {
    this.checks.set(id, {
      id,
      fn: checkFn,
      interval: options.interval || 300000, // 5 min default
      timeout: options.timeout || 10000,
      critical: options.critical || false,
      name: options.name || id,
      type: options.type || CHECK_TYPES.API
    });
  }

  async runCheck(id) {
    const check = this.checks.get(id);
    if (!check) {
      console.warn(`Health check ${id} not found`);
      return null;
    }

    const startTime = Date.now();
    let status = HEALTH_STATUS.UNKNOWN;
    let error = null;
    let responseTime = 0;

    try {
      // Run check with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), check.timeout)
      );

      const resultPromise = Promise.resolve(check.fn());
      const result = await Promise.race([resultPromise, timeoutPromise]);

      responseTime = Date.now() - startTime;
      status = result === true ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.UNHEALTHY;
    } catch (err) {
      responseTime = Date.now() - startTime;
      status = HEALTH_STATUS.UNHEALTHY;
      error = err.message;
    }

    const result = {
      checkId: id,
      status,
      responseTime,
      error,
      timestamp: new Date().toISOString(),
      critical: check.critical
    };

    this.results.push(result);

    // Log critical failures
    if (check.critical && status === HEALTH_STATUS.UNHEALTHY) {
      await this.logCriticalFailure(check, error);
    }

    return result;
  }

  async runAllChecks() {
    const results = [];
    for (const [id] of this.checks) {
      const result = await this.runCheck(id);
      if (result) results.push(result);
    }
    return results;
  }

  async logCriticalFailure(check, error) {
    try {
      await base44.functions.invoke('logHealthCheck', {
        checkId: check.id,
        checkName: check.name,
        checkType: check.type,
        status: HEALTH_STATUS.UNHEALTHY,
        error,
        critical: true
      });
    } catch (err) {
      console.error('Failed to log critical health failure:', err);
    }
  }

  getStatus() {
    if (this.results.length === 0) return HEALTH_STATUS.UNKNOWN;

    const recentResults = this.results.slice(-this.checks.size);
    const criticalFailed = recentResults.filter(
      r => r.critical && r.status !== HEALTH_STATUS.HEALTHY
    );
    const anyFailed = recentResults.filter(
      r => r.status !== HEALTH_STATUS.HEALTHY
    );

    if (criticalFailed.length > 0) {
      return HEALTH_STATUS.UNHEALTHY;
    }

    if (anyFailed.length > 0) {
      return HEALTH_STATUS.DEGRADED;
    }

    return HEALTH_STATUS.HEALTHY;
  }

  getAverageResponseTime() {
    if (this.results.length === 0) return 0;
    const sum = this.results.reduce((acc, r) => acc + r.responseTime, 0);
    return sum / this.results.length;
  }

  getCheckStatus(id) {
    const recentResults = this.results.filter(r => r.checkId === id).slice(-10);
    if (recentResults.length === 0) return null;

    return {
      id,
      status: recentResults[recentResults.length - 1].status,
      avgResponseTime: recentResults.reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length,
      successRate: (recentResults.filter(r => r.status === HEALTH_STATUS.HEALTHY).length / recentResults.length) * 100,
      recentResults
    };
  }

  cleanup() {
    // Keep only last 1000 results per check
    const maxResults = 1000;
    if (this.results.length > maxResults * this.checks.size) {
      this.results = this.results.slice(-(maxResults * this.checks.size));
    }
  }
}

export const healthMonitor = new HealthMonitor();

// Initialize standard health checks
export function setupStandardHealthChecks() {
  // Database connectivity
  healthMonitor.registerCheck('database', async () => {
    try {
      const result = await base44.asServiceRole.entities.ActivityLog.list('', 1);
      return Array.isArray(result);
    } catch {
      return false;
    }
  }, {
    name: 'Database Connectivity',
    type: CHECK_TYPES.DATABASE,
    critical: true,
    interval: 60000
  });

  // API endpoint health
  healthMonitor.registerCheck('api', async () => {
    try {
      // Test basic API call
      await base44.functions.invoke('healthCheck', {});
      return true;
    } catch {
      return false;
    }
  }, {
    name: 'API Health',
    type: CHECK_TYPES.API,
    critical: true,
    interval: 60000
  });

  // Payment gateway
  healthMonitor.registerCheck('stripe', async () => {
    try {
      // Minimal Stripe connectivity test
      return !!window.Stripe;
    } catch {
      return false;
    }
  }, {
    name: 'Stripe Payment Gateway',
    type: CHECK_TYPES.PAYMENT_GATEWAY,
    critical: false,
    interval: 300000
  });

  // External service integration (example)
  healthMonitor.registerCheck('external_services', async () => {
    // Check 3rd party API integrations
    return true;
  }, {
    name: 'External Services',
    type: CHECK_TYPES.EXTERNAL_SERVICE,
    critical: false,
    interval: 600000
  });
}

// Periodic health checks
export function startHealthCheckSchedule(intervalMs = 300000) {
  setInterval(async () => {
    await healthMonitor.runAllChecks();
    healthMonitor.cleanup();
  }, intervalMs);

  // Initial check
  healthMonitor.runAllChecks();
}