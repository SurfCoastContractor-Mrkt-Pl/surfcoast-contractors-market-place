import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Loader2 } from 'lucide-react';
import ConnectorSecurityInfo from '@/components/integration/ConnectorSecurityInfo';

export default function IntegrationsManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin();
          return;
        }
        const me = await base44.auth.me();
        if (me?.role === 'admin') {
          setUser(me);
        } else {
          // Non-admins redirected
          window.location.href = '/';
        }
      } catch {
        base44.auth.redirectToLogin();
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Integrations</h1>
          <p className="text-slate-600">Manage connected external accounts and services</p>
        </div>

        {/* Security Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Security & Access</h2>
          <ConnectorSecurityInfo />
        </div>

        {/* Integration Management Link */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Connected Accounts</h2>
          <p className="text-slate-600 mb-4">
            To manage your connected OAuth accounts and API integrations, visit the Base44 dashboard:
          </p>
          <a
            href="https://app.base44.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Integrations Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-sm text-slate-500 mt-4">
            In the dashboard, go to <strong>App Settings → Integrations → My integrations</strong> 
            to connect, disconnect, or manage OAuth accounts.
          </p>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-800 mb-3">
            For questions about integrations, security, or to set up custom per-user OAuth flows, 
            contact Base44 support or visit the documentation.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://docs.base44.com/Integrations/Connectors"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Connectors Documentation →
            </a>
            <span className="text-blue-200">•</span>
            <a
              href="https://app.base44.com/support"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}