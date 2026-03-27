import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, ShoppingCart, Users, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import MarketEventPayoutAnalytics from './MarketEventPayoutAnalytics';

export default function VendorAnalyticsDashboard({ shopId, shopEmail }) {
  const [period, setPeriod] = useState(90); // days

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['vendor-analytics', shopId, period],
    queryFn: () =>
      base44.functions.invoke('getVendorAnalytics', { shop_id: shopId, days: period }),
    enabled: !!shopId,
    retry: 2,
  });

  const data = analytics?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Failed to load analytics</p>
            <p className="text-sm text-red-700">{error?.message || 'Please try again.'}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return <Card className="p-12 text-center text-slate-500">No analytics data available</Card>;
  }

  const { summary, top_listings, trend_data } = data;

  // Format currency
  const formatCurrency = (val) => `$${val.toFixed(2)}`;
  const formatNumber = (val) => val.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Market Event Payout Analytics */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Market Event Sales & Payouts</h2>
        <MarketEventPayoutAnalytics shopId={shopId} shopEmail={shopEmail} />
      </div>

      <hr className="my-8 border-slate-200" />

      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {[7, 30, 90].map((days) => (
          <Button
            key={days}
            variant={period === days ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(days)}
          >
            Last {days} days
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.total_revenue)}</p>
              <p className="text-xs text-slate-500 mt-1">{summary.total_orders} orders</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Order Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.avg_order_value)}</p>
              <p className="text-xs text-slate-500 mt-1">per transaction</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatNumber(summary.total_orders)}</p>
              <p className="text-xs text-slate-500 mt-1">transactions</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-orange-600 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer Reach</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatNumber(summary.unique_customers)}</p>
              <p className="text-xs text-slate-500 mt-1">unique customers</p>
            </div>
            <Users className="w-8 h-8 text-purple-600 flex-shrink-0" />
          </div>
        </Card>
      </div>

      {/* Revenue & Orders Trend */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Revenue & Orders Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} yAxisId="left" />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} yAxisId="right" orientation="right" />
            <Tooltip 
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              formatter={(val, name) => {
                if (name === 'revenue') return [formatCurrency(val), 'Revenue'];
                if (name === 'orders') return [val, 'Orders'];
                return [val, name];
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
              name="Revenue"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={false}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Customer Reach Trend */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Customer Reach Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trend_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              formatter={(val) => [val, 'Unique Customers']}
            />
            <Bar dataKey="customers" fill="#a78bfa" name="Unique Customers" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Listings */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Top Performing Listings</h3>
        {top_listings.length === 0 ? (
          <p className="text-sm text-slate-500">No listings sold in this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Product</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Qty Sold</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {top_listings.map((listing, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {listing.image_url && (
                          <img
                            src={listing.image_url}
                            alt={listing.product_name}
                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <span className="font-medium text-slate-900 truncate">{listing.product_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">{formatNumber(listing.quantity_sold)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatCurrency(listing.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}