import { base44 } from '@/api/base44Client';

/**
 * Log an error to the ErrorLog entity via the logError backend function.
 * Call this in catch blocks throughout profile setup, payments, job posting, etc.
 * 
 * @param {object} params
 * @param {'profile_setup'|'payment'|'job_posting'|'verification'|'messaging'|'other'} params.error_type
 * @param {'low'|'medium'|'high'|'critical'} params.severity
 * @param {string} params.user_email
 * @param {'contractor'|'customer'|'unknown'} params.user_type
 * @param {string} params.action - What the user was doing
 * @param {string} params.error_message - The error message
 * @param {object} [params.context] - Extra context object (optional)
 */
export async function logError({ error_type = 'other', severity = 'medium', user_email = 'unknown', user_type = 'unknown', action, error_message, context }) {
  try {
    await base44.functions.invoke('logError', {
      error_type,
      severity,
      user_email,
      user_type,
      action,
      error_message,
      context,
    });
  } catch (e) {
    // Never throw — error logging must be silent
    console.warn('[logError] Failed to log error:', e.message);
  }
}