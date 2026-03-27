import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, DollarSign, ShoppingCart, Star, TrendingUp } from 'lucide-react';

export default function MarketShopAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('getMarketShopAnalytics', {});
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load analytics. Please try again.');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6 border border-red-200">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-slate-900">Error</h2>
              <p className="text-slate-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-center">No data available yet.</p>
        </div>
      </div>
    );
  }

  const { shop, summary, chartData } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{shop.name} Analytics</h1>
          <p className="text-slate-600 mt-1">
            {shop.type === 'farmers_market' ? 'Farmers Market' : shop.type === 'swap_meet' ? 'Swap Meet' : 'Market'} Vendor
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-slate-900">
                  ${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <DollarSign className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
              <p className="text-xs text-slate-500 mt-2">{summary.totalOrders} orders</p>
            </CardContent>
          </Card>

          {/* Vendor Payout */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Your Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">
                  ${summary.totalVendorPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
              </div>
              <p className="text-xs text-slate-500 mt-2">95% of revenue</p>
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-slate-900">
                  ${parseFloat(summary.averageOrderValue).toFixed(2)}
                </div>
                <ShoppingCart className="w-8 h-8 text-orange-600 opacity-20" />
              </div>
              <p className="text-xs text-slate-500 mt-2">per transaction</p>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-slate-900">{summary.averageRating}</div>
                <Star className="w-8 h-8 text-amber-600 opacity-20" />
              </div>
              <p className="text-xs text-slate-500 mt-2">{summary.totalReviews} reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Total Revenue" />
                  <Line type="monotone" dataKey="vendorPayout" stroke="#10b981" name="Your Payout" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Volume */}
          <Card>
            <CardHeader>
              <CardTitle>Order Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#f59e0b" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Average Rating Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Rating Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.filter((d) => d.averageRating !== null)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip formatter={(value) => value ? value.toFixed(2) : '-'} />
                  <Legend />
                  <Line type="monotone" dataKey="averageRating" stroke="#f59e0b" name="Avg Rating" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentOrders && data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{order.orderNumber}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.placedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${order.total.toFixed(2)}</p>
                        <p className={`text-xs font-medium ${order.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-6">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}