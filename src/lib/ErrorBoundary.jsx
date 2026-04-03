import React, { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorCount = this.state.errorCount + 1;
    this.setState({
      error,
      errorInfo,
      errorCount
    });

    // Log to console for debugging
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Log error to backend ErrorLog entity
    this.logErrorToBackend(error, errorInfo, errorCount);
  }

  logErrorToBackend = async (error, errorInfo, errorCount) => {
    try {
      // Only log if we have a valid error message
      if (!error?.message) return;

      const timestamp = new Date().toISOString();
      
      // Determine severity
      let severity = 'low';
      if (errorCount > 2) severity = 'critical';
      else if (error.message.includes('payment') || error.message.includes('auth')) severity = 'critical';
      else if (error.message.includes('failed') || error.message.includes('error')) severity = 'high';
      
      // Log to new ErrorLog entity
      base44.functions.invoke('logFrontendError', {
        userEmail: 'unknown@surfcoast.io',
        userName: 'Unknown User',
        pageOrFeature: window.location.pathname,
        actionAttempted: 'Component Render',
        errorMessage: error.message,
        errorStack: error.stack || '',
        platform: window.innerWidth < 768 ? 'mobile' : 'desktop',
        system: 'main_app'
      }).catch(() => {});
    } catch (logError) {
      console.error('Failed to log error to backend:', logError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isCritical = this.state.errorCount > 2;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-xl p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-center text-slate-900 mb-3">
                {isCritical ? 'Something Went Wrong' : 'Oops!'}
              </h1>

              {/* Error Message */}
              <p className="text-center text-slate-600 mb-6 leading-relaxed">
                {isCritical
                  ? 'We encountered a critical error. Please try reloading the page or contacting support if the problem persists.'
                  : 'An unexpected error occurred while rendering this page. Try refreshing or returning to the home page.'}
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 p-3 bg-slate-100 rounded text-xs text-slate-700 max-h-40 overflow-y-auto">
                  <summary className="font-semibold cursor-pointer mb-2">Error Details</summary>
                  <pre className="whitespace-pre-wrap break-words font-mono text-[11px]">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="w-full gap-2"
                >
                  <Home className="w-4 h-4" />
                  Return to Home
                </Button>
              </div>

              {/* Support Message */}
              <p className="text-xs text-slate-500 text-center mt-6">
                If this problem persists, please contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;