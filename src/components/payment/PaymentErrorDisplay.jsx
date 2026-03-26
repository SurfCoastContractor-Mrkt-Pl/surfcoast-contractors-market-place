import { AlertCircle, RefreshCw } from 'lucide-react';
import { PAYMENT_ERROR_TYPES } from '@/lib/paymentErrorHandler';

export default function PaymentErrorDisplay({
  error,
  onRetry,
  onDismiss,
}) {
  if (!error) return null;

  const isRetryable = [
    PAYMENT_ERROR_TYPES.NETWORK,
    PAYMENT_ERROR_TYPES.PROCESSING,
    PAYMENT_ERROR_TYPES.DECLINED,
  ].includes(error.type);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex gap-3 items-start">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
        <div className="flex-1 min-w-0">
          <p className="text-red-900 font-semibold text-sm mb-1">Payment Failed</p>
          <p className="text-red-700 text-sm leading-relaxed break-words">{error.message}</p>
          <div className="flex gap-2 mt-3">
            {isRetryable && onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded transition-colors"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-1.5 rounded transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}