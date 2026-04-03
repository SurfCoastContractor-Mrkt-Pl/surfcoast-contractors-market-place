import { base44 } from '@/api/base44Client';

// Setup global error handlers
export function setupGlobalErrorHandlers() {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', async (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    try {
      await base44.functions.invoke('logFrontendError', {
        userEmail: 'unknown@surfcoast.io',
        userName: 'Unknown User',
        pageOrFeature: window.location.pathname,
        actionAttempted: 'Async Operation',
        errorMessage: event.reason?.message || String(event.reason),
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
    console.error('Global error caught:', event.error);
    
    try {
      await base44.functions.invoke('logFrontendError', {
        userEmail: 'unknown@surfcoast.io',
        userName: 'Unknown User',
        pageOrFeature: window.location.pathname,
        actionAttempted: 'Global Operation',
        errorMessage: event.message || String(event.error),
        errorStack: event.error?.stack || 'No stack trace available',
        platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
        system: 'main_app'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  });
}