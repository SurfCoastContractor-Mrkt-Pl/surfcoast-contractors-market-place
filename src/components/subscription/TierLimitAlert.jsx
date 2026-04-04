import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function TierLimitAlert({ title, message, limit, current, action, onAction }) {
  const percentage = (current / limit) * 100;
  const isWarning = percentage >= 80;
  const isCapped = percentage >= 100;

  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        isCapped ? 'border-destructive bg-destructive/10' : isWarning ? 'border-primary bg-primary/10' : 'border-border bg-card'
      }`}
    >
      <div className="flex gap-3">
        <AlertCircle
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isCapped ? 'text-destructive' : isWarning ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
        <div className="flex-1">
          <h3 className={`font-semibold ${isCapped ? 'text-destructive' : isWarning ? 'text-primary' : 'text-foreground'}`}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>

          {/* Progress Bar */}
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{current} of {limit}</span>
              <span className="text-muted-foreground">{Math.round(percentage)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isCapped ? 'bg-destructive' : isWarning ? 'bg-primary' : 'bg-secondary'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* CTA */}
          {action && onAction && (
            <button
              onClick={onAction}
              className="mt-3 text-xs font-semibold text-primary hover:underline"
            >
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}