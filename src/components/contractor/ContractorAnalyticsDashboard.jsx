import React from 'react';
import { Card } from '@/components/ui/card';
import { Eye, MessageSquare, Quote, TrendingUp } from 'lucide-react';

export default function ContractorAnalyticsDashboard({ contractor, profileViews = 0, messageInquiries = 0, quoteRequests = 0 }) {
  const metrics = [
    {
      label: 'Profile Views',
      value: profileViews,
      icon: Eye,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Message Inquiries',
      value: messageInquiries,
      icon: MessageSquare,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Quote Requests',
      value: quoteRequests,
      icon: Quote,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Jobs Completed',
      value: contractor?.completed_jobs_count || 0,
      icon: TrendingUp,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Analytics</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase">{metric.label}</span>
                <div className={`w-8 h-8 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${metric.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}