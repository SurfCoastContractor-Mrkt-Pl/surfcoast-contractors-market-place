import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, TrendingUp, Users, Calendar, MessageCircle, Package, CheckCircle, Zap } from 'lucide-react';

export default function MarketBoothMetrics({ shop }) {
  const [metrics, setMetrics] = useState({
    marketAppearances: 0,
    totalInquiries: 0,
    avgRating: 0,
    reviewCount: 0,
    categoriesCount: 0,
    subscriptionStatus: 'inactive',
    verifiedVendor: false,
    loading: true,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const marketAppearances = shop?.market_events?.length || 0;
        const [inquiries, reviews] = await Promise.all([
          base44.entities.VendorInquiry?.filter?.({ shop_id: shop.id }).catch(() => []) || [],
          base44.entities.VendorReview?.filter?.({ shop_id: shop.id }).catch(() => []) || [],
        ]);

        const avgRating = shop?.average_rating || 0;
        const reviewCount = shop?.total_ratings || 0;
        const totalInquiries = inquiries?.length || 0;
        const categoriesCount = shop?.categories?.length || 0;
        const subscriptionStatus = shop?.subscription_status || 'inactive';
        const verifiedVendor = shop?.verified_vendor || false;

        setMetrics({
          marketAppearances,
          totalInquiries,
          avgRating,
          reviewCount,
          categoriesCount,
          subscriptionStatus,
          verifiedVendor,
          loading: false,
        });
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };
    fetchMetrics();
  }, [shop]);

  if (metrics.loading) {
    return <Loader2 className="w-5 h-5 animate-spin text-slate-400" />;
  }

  const metricItems = [
    {
      label: 'Market Appearances',
      value: metrics.marketAppearances,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Inquiries',
      value: metrics.totalInquiries,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Rating',
      value: metrics.avgRating > 0 ? metrics.avgRating.toFixed(1) : '—',
      subtitle: `(${metrics.reviewCount} reviews)`,
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Categories',
      value: metrics.categoriesCount,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Subscription',
      value: metrics.subscriptionStatus === 'active' ? 'Active' : 'Inactive',
      icon: Zap,
      color: metrics.subscriptionStatus === 'active' ? 'text-emerald-600' : 'text-slate-400',
      bgColor: metrics.subscriptionStatus === 'active' ? 'bg-emerald-50' : 'bg-slate-100',
    },
    {
      label: 'Verified Vendor',
      value: metrics.verifiedVendor ? '✓' : '—',
      icon: CheckCircle,
      color: metrics.verifiedVendor ? 'text-cyan-600' : 'text-slate-400',
      bgColor: metrics.verifiedVendor ? 'bg-cyan-50' : 'bg-slate-100',
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 sm:gap-4">
      {metricItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`flex flex-col items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg border border-slate-200 ${item.bgColor}`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${item.color}`} />
              <span className={`text-lg sm:text-xl font-bold ${item.color}`}>{item.value}</span>
            </div>
            <span className="text-xs font-medium text-slate-600 text-center">{item.label}</span>
            {item.subtitle && <span className="text-xs text-slate-500">{item.subtitle}</span>}
          </div>
        );
      })}
    </div>
  );
}