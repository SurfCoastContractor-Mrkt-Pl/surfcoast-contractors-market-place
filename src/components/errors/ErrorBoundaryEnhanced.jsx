import React from 'react';
import { errorMonitor, ERROR_LEVELS, ERROR_CATEGORIES } from '@/lib/errorMonitoring';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundaryEnhanced extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    errorMonitor.logError({
      message: error.message,
      level: ERROR_LEVELS.ERROR,
      category: ERROR_CATEGORIES.UNKNOWN,
      error,
      context: {
        componentStack: errorInfo.componentStack,
        errorId
      }
    });

    this.setState({ errorId });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              An unexpected error occurred. Our team has been notified automatically.
            </p>

            {this.state.errorId && (
              <div className="bg-slate-100 rounded p-3 mb-4">
                <p className="text-xs text-slate-600">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Share this ID with support if the issue persists.
                </p>
              </div>
            )}

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-4">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 mb-2">
                  Error Details (Dev Only)
                </summary>
                <pre className="text-xs bg-slate-900 text-slate-100 p-2 rounded overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <Button
              onClick={this.handleReset}
              className="w-full gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}