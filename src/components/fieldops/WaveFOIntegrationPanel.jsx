import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  BookOpen, Zap, Network, Copy, CheckCircle, AlertCircle, 
  Loader, ChevronRight, ExternalLink 
} from 'lucide-react';

/**
 * Wave FO Integration Panel
 * Displays status and controls for QuickBooks, Sage, HubSpot integrations
 * Accessible from Wave FO admin or contractor advanced settings
 */

const INTEGRATIONS = [
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    icon: BookOpen,
    color: 'bg-blue-600',
    status: 'pending',
    description: 'Sync invoices, payments, and financial records',
    features: ['Invoice sync', 'Expense tracking', 'Payment reconciliation'],
    setupUrl: 'https://developer.intuit.com'
  },
  {
    id: 'sage',
    name: 'Sage Business Cloud',
    icon: BookOpen,
    color: 'bg-purple-600',
    status: 'pending',
    description: 'Connect to Sage for automated accounting',
    features: ['Sales invoices', 'Purchase ledger', 'Expense management'],
    setupUrl: 'https://www.sage.com/en-us/'
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    icon: Network,
    color: 'bg-orange-600',
    status: 'connected',
    description: 'Manage leads, deals, and customer relationships',
    features: ['Deal creation', 'Contact sync', 'Timeline logging'],
    setupUrl: 'https://www.hubspot.com'
  }
];

export default function WaveFOIntegrationPanel({ scopeId, onIntegrationSync }) {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [syncing, setSyncing] = useState({});
  const [testing, setTesting] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  // Test connection on mount
  useEffect(() => {
    testAllConnections();
  }, []);

  const testAllConnections = async () => {
    for (const integration of INTEGRATIONS) {
      await testConnection(integration.id);
    }
  };

  const testConnection = async (integrationId) => {
    setTesting(prev => ({ ...prev, [integrationId]: true }));
    try {
      const response = await base44.functions.invoke('waveFOIntegrationManager', {
        action: 'testConnection',
        payload: { platform: integrationId }
      });

      setIntegrations(prev =>
        prev.map(i => 
          i.id === integrationId
            ? { ...i, status: response.data.connected ? 'connected' : 'disconnected' }
            : i
        )
      );
    } catch (error) {
      console.error(`Test failed for ${integrationId}:`, error);
      setIntegrations(prev =>
        prev.map(i =>
          i.id === integrationId ? { ...i, status: 'error' } : i
        )
      );
    } finally {
      setTesting(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleSync = async (integrationId) => {
    if (!scopeId) {
      alert('No scope selected. Please select a job to sync.');
      return;
    }

    setSyncing(prev => ({ ...prev, [integrationId]: true }));
    try {
      const actionMap = {
        quickbooks: 'syncQuickBooks',
        sage: 'syncSage',
        hubspot: 'syncHubSpot'
      };

      const response = await base44.functions.invoke('waveFOIntegrationManager', {
        action: actionMap[integrationId],
        payload: { scope_id: scopeId }
      });

      if (response.data.success) {
        onIntegrationSync?.(integrationId, response.data);
      }
    } catch (error) {
      console.error(`Sync failed for ${integrationId}:`, error);
      alert(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen p-4 lg:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Integration Dashboard</h1>
        <p className="text-slate-400">Connect Wave FO to accounting, CRM, and marketing platforms</p>
      </div>

      {/* Integration Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(integration => {
          const Icon = integration.icon;
          const isExpanded = expandedId === integration.id;
          const statusConfig = {
            connected: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20', label: 'Connected' },
            pending: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-900/20', label: 'Not Connected' },
            disconnected: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-900/20', label: 'Disconnected' },
            error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-900/20', label: 'Connection Error' }
          };
          const status = statusConfig[integration.status] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <div
              key={integration.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'border-blue-500/50 bg-slate-900 col-span-full'
                  : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
              }`}
            >
              {/* Card Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                className="w-full p-4 flex items-start justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1 text-left">
                  <div className={`${integration.color} p-3 rounded-xl flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{integration.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-800 pt-4 space-y-4">
                  {/* Features List */}
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Features</p>
                    <div className="space-y-1.5">
                      {integration.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {integration.status === 'pending' ? (
                      <a
                        href={integration.setupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Setup Integration
                      </a>
                    ) : (
                      <button
                        onClick={() => handleSync(integration.id)}
                        disabled={syncing[integration.id]}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        {syncing[integration.id] ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Sync Now
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => testConnection(integration.id)}
                      disabled={testing[integration.id]}
                      className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      {testing[integration.id] ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <p className="text-slate-400 text-xs">
                      {integration.status === 'connected'
                        ? `✅ ${integration.name} is connected and ready to sync.`
                        : `ℹ️ Click "Setup Integration" to connect your ${integration.name} account.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="max-w-4xl mx-auto mt-8 bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">📱 Mobile-Optimized Syncing</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          All integrations are optimized for mobile devices with offline support. 
          Failed syncs are automatically retried when your connection is restored. 
          Sync status is tracked in real-time, and you can monitor progress from the Wave FO dashboard.
        </p>
      </div>
    </div>
  );
}