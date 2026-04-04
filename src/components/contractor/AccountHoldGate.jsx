import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { canAccessFeature } from '@/lib/accountHoldLogic';

/**
 * Account Hold Gate
 * Blocks feature access if contractor account is on hold
 * Usage: Wrap components that should be restricted
 */
export default function AccountHoldGate({ contractor, feature, scopes = [], children, fallback }) {
  const check = canAccessFeature(contractor, feature, scopes);

  if (check.allowed) return children;

  return (
    fallback || (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex gap-3 items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <CardTitle className="text-lg text-red-900">Account Restricted</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-800 mb-4">{check.blockedReason}</p>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-100"
            onClick={() => window.location.href = '/ContractorAccount'}
          >
            Go to Account Settings
          </Button>
        </CardContent>
      </Card>
    )
  );
}