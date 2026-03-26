import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ErrorAlert({ 
  message, 
  title = 'Error',
  onDismiss,
  autoClose = false,
  autoCloseDelay = 5000,
  variant = 'error'
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !message) return null;

  const bgColor = variant === 'error' ? 'bg-red-50' : 'bg-amber-50';
  const borderColor = variant === 'error' ? 'border-red-200' : 'border-amber-200';
  const iconColor = variant === 'error' ? 'text-red-600' : 'text-amber-600';
  const titleColor = variant === 'error' ? 'text-red-900' : 'text-amber-900';
  const textColor = variant === 'error' ? 'text-red-700' : 'text-amber-700';

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-4 flex gap-3 items-start`}>
      <AlertCircle className={`${iconColor} flex-shrink-0 mt-0.5`} size={18} />
      <div className="flex-1 min-w-0">
        {title && <p className={`${titleColor} font-semibold text-sm mb-1`}>{title}</p>}
        <p className={`${textColor} text-sm leading-relaxed break-words`}>{message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className={`${textColor} hover:opacity-70 flex-shrink-0 mt-0.5 transition-opacity`}
        aria-label="Dismiss error"
      >
        <X size={16} />
      </button>
    </div>
  );
}