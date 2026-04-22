import { base44 } from '@/api/base44Client';

// Errors from routine auth checks on a public app that are not real bugs
const IGNORABLE_ERROR_PATTERNS = [
  'timeout',
  'Unauthorized',
  'auth_required',
  'user_not_registered',
  '401',
  '403',
  'NetworkError',
  'Failed to fetch',
  'Load failed',
  'AbortError',
  'ResizeObserver loop',
];

function isIgnorableError(message = '') {
  const msg = String(message).toLowerCase();
  return IGNORABLE_ERROR_PATTERNS.some(p => msg.includes(p.toLowerCase()));
}

// Setup global error handlers
export function setupGlobalErrorHandlers() {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', async (event) => {
    const message = event.reason?.message || String(event.reason);

    // Don't log routine auth/network noise — these fire on every public (unauthenticated)
    // visit and previously caused analytics tools to record a false "exit" signal on load.
    if (isIgnorableError(message)) {
      console.warn('[globalErrorHandler] Suppressed ignorable rejection:', message);
      return;
    }

    console.error('Unhandled promise rejection:', event.reason);
    
    try {
      await base44.functions.invoke('logFrontendError', {
        userEmail: 'unknown@surfcoast.io',
        userName: 'Unknown User',
        pageOrFeature: window.location.pathname,
        actionAttempted: 'Async Operation',
        errorMessage: message,
        errorStack: event.reason?.stack || 'No stack trace available',
        platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
        system: 'main_app'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  });

  // Catch global errors
  window.addEventListener('error', async (event) => {
    const message = event.message || String(event.error);

    if (isIgnorableError(message)) {
      console.warn('[globalErrorHandler] Suppressed ignorable error:', message);
      return;
    }

    console.error('Global error caught:', event.error);
    
    try {
      await base44.functions.invoke('logFrontendError', {
        userEmail: 'unknown@surfcoast.io',
        userName: 'Unknown User',
        pageOrFeature: window.location.pathname,
        actionAttempted: 'Global Operation',
        errorMessage: message,
        errorStack: event.error?.stack || 'No stack trace available',
        platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
        system: 'main_app'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  });
}