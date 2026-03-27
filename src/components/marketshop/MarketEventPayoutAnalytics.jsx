import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function MarketEventPayoutAnalytics({ shopId, shopEmail }) {
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch sales data for this shop
  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['market-event-sales', shopId],
    queryFn: async () => {
      try {
        const result = await base44.entities.MarketEventSale.filter({
          market_shop_id: shopId
        });
        return result || [];
      } catch (err) {
        console.error('Error fetching sales:', err);
        return [];
      }
    },
    staleTime: 30000
  });

  // Process and aggregate sales data
  const aggregatedData = React.useMemo(() => {
    if (!sales.length) return { byEvent: [], summary: null };

    // Group by market event
    const grouped = sales.reduce((acc, sale) => {
      const key = `${sale.market_event_name} (${sale.market_event_date})`;
      if (!acc[key]) {
        acc[key] = {
          event: sale.market_event_name,
          date: sale.market_event_date,
          sales: [],
          totalSales: 0,
          platformFee: 0,
          vendorPayout: 0,
          pending: 0,
          paid: 0
        };
      }
      acc[key].sales.push(sale);
      acc[key].totalSales += sale.sale_amount || 0;
      
      const fee = Math.round((sale.sale_amount * 5) / 100);
      acc[key].platformFee += fee;
      acc[key].vendorPayout += (sale.sale_amount - fee);
      
      if (sale.payout_status === 'pending') acc[key].pending++;
      if (sale.payout_status === 'paid') acc[key].paid++;
      
      return acc;
    }, {});

    const byEvent = Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));

    const summary = byEvent.reduce((acc, evt) => ({
      totalSales: acc.totalSales + evt.totalSales,
      totalFees: acc.totalFees + evt.platformFee,
      totalPayout: acc.totalPayout + evt.vendorPayout,
      totalTransactions: acc.totalTransactions + evt.sales.length,
      pendingSales: acc.pendingSales + evt.pending,
      paidSales: acc.paidSales + evt.paid
    }), { totalSales: 0, totalFees: 0, totalPayout: 0, totalTransactions: 0, pendingSales: 0, paidSales: 0 });

    return { byEvent, summary };
  }, [sales]);

  const filteredEvents = React.useMemo(() => {
    if (filterStatus === 'all') return aggregatedData.byEvent;
    if (filterStatus === 'pending') return aggregatedData.byEvent.filter(e => e.pending > 0);
    if (filterStatus === 'paid') return aggregatedData.byEvent.filter(e => e.paid > 0);
    return aggregatedData.byEvent;
  }, [aggregatedData.byEvent, filterStatus]);

  const chartData = filteredEvents.map(evt => ({
    name: `${evt.event} (${evt.date})`,
    'Total Sales': evt.totalSales / 100,
    'Your Payout': evt.vendorPayout / 100,
    'Platform Fee': evt.platformFee / 100
  }));

  if (salesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!sales.length) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Sales Yet</h3>
        <p className="text-slate-500 text-sm">Sales recorded at market events will appear here.</p>
      </div>
    );
  }

  const { summary } = aggregatedData;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-700 uppercase">Total Sales</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">${(summary.totalSales / 100).toFixed(2)}</p>
          <p className="text-xs text-blue-600 mt-1">{summary.totalTransactions} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-700 uppercase">Your Payout</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">${(summary.totalPayout / 100).toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-1">95% of total sales</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase">Platform Fee (5%)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900">${(summary.totalFees / 100).toFixed(2)}</p>
          <p className="text-xs text-amber-600 mt-1">Deducted automatically</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 uppercase">Payout Status</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-sm text-green-600 font-semibold">{summary.paidSales} Paid</span>
            <span className="text-slate-400">•</span>
            <span className="text-sm text-amber-600 font-semibold">{summary.pendingSales} Pending</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Sales & Payout Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
                contentStyle={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="Total Sales" fill="#3b82f6" />
              <Bar dataKey="Your Payout" fill="#10b981" />
              <Bar dataKey="Platform Fee" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filter & Events List */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            Pending Payouts ({summary.pendingSales})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filterStatus === 'paid'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Paid ({summary.paidSales})
          </button>
        </div>

        <div className="space-y-3">
          {filteredEvents.map((event, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-900">{event.event}</h4>
                  <p className="text-sm text-slate-500">{event.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${(event.vendorPayout / 100).toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{event.sales.length} sales</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className="bg-blue-50 rounded p-2 border border-blue-100">
                  <span className="text-blue-700 font-semibold">${(event.totalSales / 100).toFixed(2)}</span>
                  <p className="text-blue-600">Total Sales</p>
                </div>
                <div className="bg-amber-50 rounded p-2 border border-amber-100">
                  <span className="text-amber-700 font-semibold">${(event.platformFee / 100).toFixed(2)}</span>
                  <p className="text-amber-600">Fee (5%)</p>
                </div>
                <div className="bg-slate-50 rounded p-2 border border-slate-200">
                  <span className="text-slate-700 font-semibold">{event.paid}/{event.sales.length}</span>
                  <p className="text-slate-600">Paid Out</p>
                </div>
              </div>
              <div className="flex gap-2">
                {event.pending > 0 && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                    <Clock className="w-3 h-3" /> {event.pending} Pending
                  </span>
                )}
                {event.paid > 0 && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> {event.paid} Paid
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>About SurfCoast Facilitation Fee:</strong> A 5% platform facilitation fee is automatically deducted from each sale to cover payment processing and platform maintenance. You receive 95% of every sale.
        </p>
      </div>
    </div>
  );
}