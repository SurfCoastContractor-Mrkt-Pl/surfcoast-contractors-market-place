import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, CheckCircle2, Star, Briefcase } from 'lucide-react';

export default function SocialProofMetrics() {
  const { data: metrics = {} } = useQuery({
    queryKey: ['socialMetrics'],
    queryFn: async () => {
      const [contractors, scopes, reviews] = await Promise.all([
        base44.entities.Contractor.list('-created_date', 1000),
        base44.entities.ScopeOfWork.filter({ status: 'closed' }, '-closed_date', 1000),
        base44.entities.Review.filter({ verified: true }, '-created_date', 1000),
      ]);

      const verifiedContractors = contractors?.filter(c => c.identity_verified)?.length || 0;
      const completedJobs = scopes?.length || 0;
      const avgRating = reviews?.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1)
        : 0;

      return {
        verifiedContractors,
        completedJobs,
        avgRating,
        totalReviews: reviews?.length || 0,
      };
    },
  });

  const stats = [
    {
      icon: Users,
      value: metrics.verifiedContractors?.toLocaleString() || '0',
      label: 'Verified Professionals',
    },
    {
      icon: CheckCircle2,
      value: metrics.completedJobs?.toLocaleString() || '0',
      label: 'Jobs Completed',
    },
    {
      icon: Star,
      value: metrics.avgRating || '0',
      label: 'Avg. Rating',
      suffix: '⭐',
    },
    {
      icon: Briefcase,
      value: metrics.totalReviews?.toLocaleString() || '0',
      label: 'Verified Reviews',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 md:p-12 mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Trusted by Thousands</h2>
        <p className="text-slate-600">Real results from real professionals</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {stat.value}
                {stat.suffix && <span className="text-2xl ml-1">{stat.suffix}</span>}
              </div>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}