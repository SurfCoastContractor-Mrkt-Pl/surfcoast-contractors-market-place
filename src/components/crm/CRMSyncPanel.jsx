import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import HubSpotConnectButton from './HubSpotConnectButton';

export default function CRMSyncPanel({ connectorName = "-build as needed", userType = "contractor" }) {
  const [syncStatus, setSyncStatus] = useState(null);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-3">HubSpot Connection</label>
        <HubSpotConnectButton connectorName={connectorName} />
      </div>

      <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 space-y-2">
        <p className="font-medium text-slate-700">CRM Integration Features:</p>
        {userType === 'contractor' ? (
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Sync completed jobs → HubSpot Deals</li>
            <li>Customer info → HubSpot Contacts</li>
            <li>Job reviews → Contact ratings & feedback</li>
            <li>Earnings & payout data → Deal custom fields</li>
          </ul>
        ) : (
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Sync shop listings → HubSpot Products</li>
            <li>Inquiries → HubSpot Deals</li>
            <li>Vendor reviews → Contact ratings</li>
            <li>Sales analytics → Deal metrics</li>
          </ul>
        )}
        <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
          Data syncs automatically when you authorize your HubSpot account.
        </p>
      </div>
    </div>
  );
}