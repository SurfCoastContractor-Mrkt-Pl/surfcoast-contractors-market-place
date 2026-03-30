// Rate Limiting & Request Throttling
// Protects API from abuse with configurable limits per endpoint/user

import { base44 } from '@/api/base44Client';

export const LIMIT_TYPES = {
  PER_MINUTE: 'minute',
  PER_HOUR: 'hour',
  PER_DAY: 'day'
};

// In-memory store for frontend rate limiting
class FrontendRateLimiter {
  constructor() {
    this.requests = new Map();
  }

  isAllowed(key, limit, window = 60000) {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside window
    const recentRequests = requests.filter(time => now - time < window);

    if (recentRequests.length >= limit) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  reset(key) {
    this.requests.delete(key);
  }

  getStatus(key, limit, window = 60000) {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(time => now - time < window);

    return {
      remaining: Math.max(0, limit - recentRequests.length),
      limit,
      resetIn: recentRequests.length > 0 ? window - (now - recentRequests[0]) : 0
    };
  }

  cleanup() {
    const now = Date.now();
    const maxWindow = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, requests] of this.requests.entries()) {
      const recent = requests.filter(time => now - time < maxWindow);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }
}

export const frontendLimiter = new FrontendRateLimiter();

// Throttle function calls
export function throttle(fn, delay, options = {}) {
  let timeout;
  let lastRun = 0;
  const maxWait = options.maxWait || delay * 10;
  let maxWaitTimeout;

  return function throttled(...args) {
    const now = Date.now();

    clearTimeout(timeout);
    clearTimeout(maxWaitTimeout);

    if (now - lastRun >= delay) {
      fn.apply(this, args);
      lastRun = now;
    } else {
      timeout = setTimeout(() => {
        fn.apply(this, args);
        lastRun = Date.now();
      }, delay - (now - lastRun));
    }

    // Ensure function runs at least once within maxWait
    maxWaitTimeout = setTimeout(() => {
      if (Date.now() - lastRun >= maxWait) {
        fn.apply(this, args);
        lastRun = Date.now();
      }
    }, maxWait);
  };
}

// Debounce function calls
export function debounce(fn, delay) {
  let timeout;

  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Check rate limit with backend
export async function checkRateLimit(endpoint, userId = null) {
  try {
    const response = await base44.functions.invoke('checkRateLimit', {
      endpoint,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: false, error: error.message };
  }
}

// Retry with exponential backoff
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Request queue for sequential execution
export class RequestQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      this.running++;
      const { fn, resolve, reject } = this.queue.shift();

      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.running--;
        this.process();
      }
    }
  }

  clear() {
    this.queue = [];
  }
}

// Cleanup in-memory store periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    frontendLimiter.cleanup();
  }, 60 * 60 * 1000); // Every hour
}