import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Briefcase, Star, Eye } from 'lucide-react';

export default function SocialProofStats() {
  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => base44.functions.invoke('getPlatformStats', {}).then(res => res.data),
    staleTime: 15 * 60 * 1000, // 15 min — stats don't change second-to-second
    gcTime: 30 * 60 * 1000,
  });

  const items = [
    {
      icon: Users,
      value: stats?.active_contractors ?? '—',
      label: 'Verified Pros',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Briefcase,
      value: stats?.completed_jobs ?? '—',
      label: 'Jobs Completed',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: Star,
      value: stats?.verified_reviews ?? '—',
      label: 'Verified Reviews',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      icon: Eye,
      value: stats?.profile_views ?? '—',
      label: 'Profile Views',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <section className="py-10 px-4 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
          Platform Activity
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {items.map(({ icon: Icon, value, label, color, bg }) => (
            <div key={label} className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
              <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</span>
              <span className="text-sm text-gray-500 mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}