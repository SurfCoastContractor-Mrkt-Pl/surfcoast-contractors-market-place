// Performance Analytics & Monitoring
// Tracks system performance, API latency, function execution time, and user engagement

import { base44 } from '@/api/base44Client';

export const METRIC_TYPES = {
  API_LATENCY: 'api_latency',
  FUNCTION_EXECUTION: 'function_execution',
  PAGE_LOAD: 'page_load',
  USER_ACTION: 'user_action',
  DATABASE_QUERY: 'database_query',
  ERROR_RATE: 'error_rate',
  MEMORY_USAGE: 'memory_usage',
  CPU_USAGE: 'cpu_usage'
};

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.timers = new Map();
    this.isOnline = navigator.onLine;
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', () => { this.isOnline = true; this.flushMetrics(); });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  // Start measuring a timed operation
  startTimer(id) {
    this.timers.set(id, {
      start: performance.now(),
      startMark: `perf_start_${id}`
    });
    
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`perf_start_${id}`);
    }
  }

  // Stop timer and record metric
  stopTimer(id, metricType, metadata = {}) {
    const timer = this.timers.get(id);
    if (!timer) {
      console.warn(`Timer ${id} not found`);
      return 0;
    }

    const duration = performance.now() - timer.start;
    this.timers.delete(id);

    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`perf_end_${id}`);
      try {
        performance.measure(`perf_measure_${id}`, `perf_start_${id}`, `perf_end_${id}`);
      } catch {}
    }

    this.recordMetric(metricType, duration, metadata);
    return duration;
  }

  // Record a metric
  async recordMetric(metricType, value, metadata = {}) {
    try {
      const metric = {
        metric_type: metricType,
        value,
        metadata: JSON.stringify(metadata),
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      };

      this.metrics.push(metric);

      // Flush if we have enough metrics or if it's been a while
      if (this.metrics.length >= 20) {
        this.flushMetrics();
      }
    } catch (err) {
      console.error('Error recording metric:', err);
    }
  }

  // Send metrics to backend
  async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    if (this.isOnline) {
      try {
        await base44.functions.invoke('logPerformanceMetrics', {
          metrics: metricsToSend
        });
      } catch (err) {
        console.error('Failed to flush metrics:', err);
        // Re-queue if failed
        this.metrics = metricsToSend.concat(this.metrics);
      }
    } else {
      // Re-queue if offline
      this.metrics = metricsToSend.concat(this.metrics);
      this.saveMetricsToLocalStorage();
    }
  }

  saveMetricsToLocalStorage() {
    try {
      localStorage.setItem('performanceMetrics', JSON.stringify(this.metrics));
    } catch {}
  }

  loadMetricsFromLocalStorage() {
    try {
      const saved = localStorage.getItem('performanceMetrics');
      if (saved) {
        this.metrics = JSON.parse(saved);
        this.flushMetrics();
      }
    } catch {}
  }

  // Measure function execution
  async measureFunction(id, fn, metadata = {}) {
    this.startTimer(id);
    try {
      const result = await fn();
      const duration = this.stopTimer(id, METRIC_TYPES.FUNCTION_EXECUTION, metadata);
      return { result, duration };
    } catch (error) {
      this.stopTimer(id, METRIC_TYPES.FUNCTION_EXECUTION, { ...metadata, error: true });
      throw error;
    }
  }

  // Measure API call
  async measureApiCall(endpoint, fn, metadata = {}) {
    this.startTimer(`api_${endpoint}`);
    try {
      const result = await fn();
      const duration = this.stopTimer(`api_${endpoint}`, METRIC_TYPES.API_LATENCY, {
        endpoint,
        ...metadata
      });
      return { result, duration };
    } catch (error) {
      this.stopTimer(`api_${endpoint}`, METRIC_TYPES.API_LATENCY, {
        endpoint,
        ...metadata,
        error: true
      });
      throw error;
    }
  }

  // Get performance stats
  getStats() {
    const allMetrics = [...this.metrics];
    
    const stats = {
      total: allMetrics.length,
      byType: {},
      averageLatency: 0
    };

    for (const metric of allMetrics) {
      if (!stats.byType[metric.metric_type]) {
        stats.byType[metric.metric_type] = {
          count: 0,
          total: 0,
          average: 0,
          min: Infinity,
          max: 0
        };
      }

      const type = stats.byType[metric.metric_type];
      type.count++;
      type.total += metric.value;
      type.min = Math.min(type.min, metric.value);
      type.max = Math.max(type.max, metric.value);
      type.average = type.total / type.count;
    }

    stats.averageLatency = Object.values(stats.byType)
      .reduce((sum, stat) => sum + stat.average, 0) / Object.keys(stats.byType).length;

    return stats;
  }

  cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    this.metrics = this.metrics.filter(m => {
      return now - new Date(m.timestamp).getTime() < maxAge;
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Initialize on app load
if (typeof window !== 'undefined') {
  performanceMonitor.loadMetricsFromLocalStorage();
  
  // Periodic flush
  setInterval(() => performanceMonitor.flushMetrics(), 30 * 1000); // Every 30 seconds
  
  // Periodic cleanup
  setInterval(() => performanceMonitor.cleanup(), 60 * 60 * 1000); // Every hour
}

// Core Web Vitals monitoring
export function setupWebVitalsMonitoring() {
  if (typeof window === 'undefined') return;

  // Page load timing
  if (performance && performance.timing) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        const connectTime = timing.responseEnd - timing.requestStart;
        const renderTime = timing.domComplete - timing.domLoading;

        performanceMonitor.recordMetric(METRIC_TYPES.PAGE_LOAD, pageLoadTime, {
          connectTime,
          renderTime,
          domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart
        });
      }, 0);
    });
  }

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        performanceMonitor.recordMetric(METRIC_TYPES.PAGE_LOAD, lastEntry.renderTime || lastEntry.loadTime, {
          metric: 'LCP'
        });
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {}
  }

  // First Input Delay (FID)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          performanceMonitor.recordMetric(METRIC_TYPES.USER_ACTION, entry.processingDuration, {
            metric: 'FID',
            name: entry.name
          });
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch {}
  }

  // Cumulative Layout Shift (CLS)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          performanceMonitor.recordMetric(METRIC_TYPES.PAGE_LOAD, entry.value * 100, {
            metric: 'CLS'
          });
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch {}
  }
}