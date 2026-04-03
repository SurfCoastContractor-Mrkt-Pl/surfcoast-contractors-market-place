import { base44 } from '@/api/base44Client';

/**
 * Log errors to database for admin review
 */
export const logError = async (message, category = 'unknown', context = {}) => {
  try {
    // Also log to console in development
    console.error(`[${category}]`, message, context);

    // Get current user if authenticated
    let userId = null;
    try {
      const user = await base44.auth.me();
      userId = user?.email || null;
    } catch {
      // User not authenticated, continue without user context
    }

    // Log to database
    await base44.entities.ErrorLog.create({
      message,
      level: 'error',
      category,
      context,
      stack: context.stack || '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      user_id: userId,
    });
  } catch (err) {
    console.error('Failed to log error:', err);
  }
};

export const logWarning = async (message, category = 'unknown', context = {}) => {
  try {
    await base44.entities.ErrorLog.create({
      message,
      level: 'warning',
      category,
      context,
    });
  } catch (err) {
    console.error('Failed to log warning:', err);
  }
};