import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import SubscriptionManager from '@/components/marketshop/SubscriptionManager';
import PaymentMethodManager from '@/components/marketshop/PaymentMethodManager';

export default function MarketShopBilling() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketShop();
  }, []);

  const loadMarketShop = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      if (user?.email) {
        const shops = await base44.entities.MarketShop.filter({
          email: user.email
        });
        setShop(shops?.[0] || null);
      }
    } catch (err) {
      console.error('Failed to load market shop:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!shop) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Market shop not found. Please complete your profile first.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{shop.shop_name} - Billing</h1>
          <p className="text-slate-600 mt-2">Manage your subscription and payment methods</p>
        </div>

        {/* Billing Status Alert */}
        {shop.status === 'suspended' && (
          <Alert className="bg-red-50 border-red-200 text-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your shop is suspended. Please resolve any outstanding billing issues to restore service.
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Management */}
        <SubscriptionManager
          shop={shop}
          onSubscriptionUpdate={loadMarketShop}
        />

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Recent charges and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              No billing history available yet
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Update your payment preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Auto-renew Subscription</p>
              <p className="text-sm text-slate-900 font-medium">Enabled</p>
              <p className="text-xs text-slate-500 mt-1">
                Your subscription will automatically renew at the end of each billing period
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}