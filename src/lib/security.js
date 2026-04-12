import { base44 } from '@/api/base44Client';

/**
 * Security utilities for hardening the app
 */

// CORS headers for Deno functions
export const getCORSHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
});

// Rate limiting cache (in-memory, use Redis for production)
const rateLimitCache = new Map();

/**
 * Simple rate limiter (token bucket algorithm)
 */
export const checkRateLimit = (key, maxRequests = 100, windowMs = 60000) => {
  const now = Date.now();
  const limit = rateLimitCache.get(key) || { tokens: maxRequests, resetTime: now + windowMs };

  if (now > limit.resetTime) {
    limit.tokens = maxRequests;
    limit.resetTime = now + windowMs;
  }

  if (limit.tokens > 0) {
    limit.tokens--;
    rateLimitCache.set(key, limit);
    return true;
  }

  return false;
};

/**
 * Input validation utilities
 */
export const validateInput = {
  // Email validation
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // URL validation
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // String length validation
  stringLength: (str, min = 1, max = 1000) => {
    return str.length >= min && str.length <= max;
  },

  // Number range validation
  numberRange: (num, min = 0, max = 100) => {
    return num >= min && num <= max;
  },

  // XSS prevention - sanitize HTML
  sanitizeHtml: (html) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  // SQL-like injection prevention
  sanitizeInput: (input) => {
    return input
      .replace(/[&<>"']/g, char => {
        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return escapeMap[char];
      });
  },
};

/**
 * Hash password (use in backend only)
 */
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verify password
 */
export const verifyPassword = async (password, hash) => {
  const newHash = await hashPassword(password);
  return newHash === hash;
};

/**
 * Generate secure random token
 */
export const generateToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
};