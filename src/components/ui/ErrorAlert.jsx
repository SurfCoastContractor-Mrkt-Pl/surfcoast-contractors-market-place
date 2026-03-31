import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ErrorAlert({
  error,
  onDismiss,
  title = 'Error',
  showDetails = false,
  className = '',
  variant = 'error'
}) {
  if (!error) return null;

  // Extract error message
  const message = typeof error === 'string' 
    ? error 
    : error?.response?.data?.error || error?.message || 'An unexpected error occurred';

  // Friendly error messages based on HTTP status or error code
  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    
    const code = error?.response?.data?.code || error?.code;
    const status = error?.response?.status;

    const friendlyMessages = {
      'UNAUTHORIZED': 'Authentication required. Please log in to proceed.',
      'FORBIDDEN': 'Access denied. You do not have permission to perform this action.',
      'BAD_REQUEST': 'Invalid request. Please check your input and try again.',
      'INTERNAL_SERVER_ERROR': 'An unexpected server error occurred. Please try again later.',
      'CONFLICT': 'This item already exists. Please choose a different option.',
      'NOT_FOUND': 'The requested item was not found.'
    };

    if (code && friendlyMessages[code]) return friendlyMessages[code];
    
    if (status === 401) return 'Authentication required. Please log in to proceed.';
    if (status === 403) return 'Access denied. You do not have permission to perform this action.';
    if (status === 400) return 'Invalid request. Please check your input and try again.';
    if (status === 404) return 'The requested item was not found.';
    if (status === 409) return 'This item already exists. Please choose a different option.';
    if (status >= 500) return 'Server error. Please try again later.';

    return message;
  };

  const displayMessage = getErrorMessage();

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 flex items-start gap-3',
        variant === 'error' && 'bg-red-50 border-red-200 text-red-800',
        variant === 'warning' && 'bg-yellow-50 border-yellow-200 text-yellow-800',
        variant === 'info' && 'bg-blue-50 border-blue-200 text-blue-800',
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold text-sm mb-1">{title}</h3>}
        <p className="text-sm leading-relaxed">{displayMessage}</p>
        {showDetails && message && message !== displayMessage && (
          <details className="mt-2 text-xs opacity-75">
            <summary className="cursor-pointer font-medium">More details</summary>
            <pre className="mt-1 whitespace-pre-wrap break-words bg-white/50 p-2 rounded text-[11px] font-mono">
              {message}
            </pre>
          </details>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-current hover:opacity-75 transition-opacity"
          aria-label="Dismiss error"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}