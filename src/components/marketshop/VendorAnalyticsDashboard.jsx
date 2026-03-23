import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp, Package, Loader2 } from 'lucide-react';

const COLORS = ['#1d4ed8', '#0891b2', '#0d9488', '#7c3aed', '#be185d', '#b45309'];

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

export default function VendorAnalyticsDashboard({ shopId, shopName }) {
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['vendor-orders', shopId],
    queryFn: () => base44.entities.ConsumerOrder.filter({ shop_id: shopId }),
    enabled: !!shopId,
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['vendor-listings', shopId],
    queryFn: () => base44.entities.MarketListing.filter({ shop_id: shopId }),
    enabled: !!shopId,
  });

  const isLoading = ordersLoading || listingsLoading;

  // --- Derived analytics ---
  const analytics = useMemo(() => {
    if (!orders.length) return null;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.consumer_email)).size;

    // Sales by day (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);

    const dayMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(thirtyDaysAgo.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    for (const order of orders) {
      const key = (order.placed_at || order.created_date || '').slice(0, 10);
      if (dayMap[key]) {
        dayMap[key].revenue += order.total || 0;
        dayMap[key].orders += 1;
      }
    }

    const salesTrend = Object.values(dayMap).map(d => ({
      ...d,
      label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    // Unique customers per week (last 8 weeks)
    const weekMap = {};
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      const weekKey = `W${8 - i}`;
      weekMap[weekKey] = { week: weekKey, customers: new Set(), label: `Wk ${8 - i}` };
    }

    for (const order of orders) {
      const orderDate = new Date(order.placed_at || order.created_date);
      const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < 8) {
        const weekKey = `W${8 - weekIndex}`;
        if (weekMap[weekKey]) weekMap[weekKey].customers.add(order.consumer_email);
      }
    }

    const customerTrend = Object.values(weekMap).map(w => ({
      label: w.label,
      customers: w.customers.size,
    }));

    // Top listings by revenue
    const listingRevMap = {};
    for (const order of orders) {
      for (const item of order.items || []) {
        if (!listingRevMap[item.listing_id]) {
          listingRevMap[item.listing_id] = {
            name: item.product_name,
            revenue: 0,
            units: 0,
          };
        }
        listingRevMap[item.listing_id].revenue += item.subtotal || item.price * item.quantity || 0;
        listingRevMap[item.listing_id].units += item.quantity || 1;
      }
    }

    const topListings = Object.values(listingRevMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const avgOrderValue = totalRevenue / totalOrders;

    return { totalRevenue, totalOrders, uniqueCustomers, avgOrderValue, salesTrend, customerTrend, topListings };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No sales data yet</p>
        <p className="text-slate-500 text-sm mt-1">Analytics will populate once customers place orders through your shop.</p>
        <div className="mt-6 grid grid-cols-2 gap-4 max-w-xs mx-auto text-left">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Active Listings</p>
            <p className="text-xl font-bold text-slate-800">{listings.filter(l => l.status === 'active').length}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Total Listings</p>
            <p className="text-xl font-bold text-slate-800">{listings.length}</p>
          </div>
        </div>
      </div>
    );
  }

  const { totalRevenue, totalOrders, uniqueCustomers, avgOrderValue, salesTrend, customerTrend, topListings } = analytics;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Sales Analytics</h2>
        <p className="text-sm text-slate-500 mt-0.5">Performance overview for {shopName}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} sub="All time" color="green" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders} sub="All time" color="blue" />
        <StatCard icon={Users} label="Unique Customers" value={uniqueCustomers} sub="All time" color="purple" />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={`$${avgOrderValue.toFixed(2)}`} sub="Per order" color="amber" />
      </div>

      {/* Sales Trend — last 30 days */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4 text-sm">Revenue — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={salesTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} labelStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2} fill="url(#colorRevenue)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Customer Reach — last 8 weeks */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4 text-sm">Customer Reach — Last 8 Weeks</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={customerTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip formatter={(v) => [v, 'Unique Customers']} labelStyle={{ fontSize: 12 }} />
            <Bar dataKey="customers" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Performing Listings */}
      {topListings.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900 text-sm">Top Performing Listings</h3>
          </div>
          <div className="space-y-3">
            {topListings.map((listing, idx) => {
              const maxRev = topListings[0]?.revenue || 1;
              const pct = (listing.revenue / maxRev) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm text-slate-800 truncate">{listing.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="text-xs text-slate-500">{listing.units} units</span>
                      <span className="text-sm font-semibold text-slate-900">${listing.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}