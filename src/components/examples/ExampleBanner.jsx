import React from 'react';
import { Eye, EyeOff, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Wraps example/fictitious content with a clear "EXAMPLE" label
 * and a toggle to show/hide. Always shows the toggle button so
 * users can bring examples back at any time.
 */
export default function ExampleBanner({ showExamples, onToggle, autoHidden, children }) {
  return (
    <div className="mb-6">
      {/* Toggle Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-slate-600">
            {autoHidden
              ? 'Examples auto-hidden — you reached 10 completions!'
              : showExamples
              ? 'Showing example entry to guide you'
              : 'Examples hidden'}
          </span>
        </div>
        {!autoHidden && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="gap-1.5 text-slate-500 hover:text-slate-800 text-xs"
          >
            {showExamples ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Hide Example
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Show Example
              </>
            )}
          </Button>
        )}
      </div>

      {/* Example Content */}
      {showExamples && (
        <div className="relative border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/50 p-1">
          {/* Label Badge */}
          <div className="absolute -top-3 left-4 z-10">
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
              Example
            </span>
          </div>
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}