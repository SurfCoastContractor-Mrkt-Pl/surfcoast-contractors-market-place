import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Error boundary for Phase 4 collaboration tabs
 * Catches errors in individual collaboration components without crashing the entire panel
 */
export default class Phase4ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Phase 4 Collaboration Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Feature Temporarily Unavailable</h3>
              <p className="text-sm text-red-700 mb-3">This collaboration feature encountered an issue. Please try refreshing the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}