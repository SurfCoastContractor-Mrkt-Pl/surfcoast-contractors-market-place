import { base44 } from '@/api/base44Client';

/**
 * Performance monitoring and metrics collection
 */

export const performanceMonitor = {
  // Track page load time
  pageLoadTime: () => {
    if (typeof window === 'undefined') return null;
    const perfData = window.performance.timing;
    return perfData.loadEventEnd - perfData.navigationStart;
  },

  // Track API response time
  async trackApiCall(endpoint, method = 'GET') {
    const start = performance.now();
    try {
      // Actual API call happens elsewhere
      return {
        track: async (response) => {
          const duration = performance.now() - start;
          await base44.asServiceRole.entities.PerformanceMetric.create({
            metric_type: 'api_latency',
            value: duration,
            unit: 'ms',
            endpoint,
            status: response?.status ? 'success' : 'error',
          });
          return response;
        },
      };
    } catch (error) {
      console.error('Error tracking API call:', error);
    }
  },

  // Measure function execution time
  async measureFunction(functionName, fn) {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      await base44.asServiceRole.entities.PerformanceMetric.create({
        metric_type: 'function_execution',
        value: duration,
        unit: 'ms',
        endpoint: functionName,
        status: 'success',
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      await base44.asServiceRole.entities.PerformanceMetric.create({
        metric_type: 'function_execution',
        value: duration,
        unit: 'ms',
        endpoint: functionName,
        status: 'error',
      });
      throw error;
    }
  },

  // Measure React component render time
  measureRender: (componentName, duration) => {
    if (duration > 1000) {
      console.warn(`⚠️ Slow render: ${componentName} took ${duration}ms`);
    }
    base44.asServiceRole.entities.PerformanceMetric.create({
      metric_type: 'page_load',
      value: duration,
      unit: 'ms',
      url: window.location.href,
      status: 'success',
    });
  },

  // Track Core Web Vitals
  async trackWebVitals() {
    if ('web-vital' in window) {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      getCLS((metric) => this.recordMetric('CLS', metric.value));
      getFID((metric) => this.recordMetric('FID', metric.value));
      getFCP((metric) => this.recordMetric('FCP', metric.value));
      getLCP((metric) => this.recordMetric('LCP', metric.value));
      getTTFB((metric) => this.recordMetric('TTFB', metric.value));
    }
  },

  recordMetric: async (name, value) => {
    try {
      await base44.asServiceRole.entities.PerformanceMetric.create({
        metric_type: 'page_load',
        value: Math.round(value),
        unit: 'ms',
        metadata: JSON.stringify({ metric: name }),
        status: 'success',
      });
    } catch (error) {
      console.error(`Failed to record ${name}:`, error);
    }
  },
};