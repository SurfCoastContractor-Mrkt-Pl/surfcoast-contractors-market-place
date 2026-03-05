import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, DollarSign, Star, Users, Camera } from 'lucide-react';

export default function CustomerProfileDisplay({ profile, jobCount }) {
  const { data: closedScopes } = useQuery({
    queryKey: ['customer-closed-scopes', profile?.email],
    queryFn: () => base44.entities.ScopeOfWork.filter({ customer_email: profile.email, status: 'closed' }),
    enabled: !!profile?.email,
  });

  const togetherPhotos = (closedScopes || []).filter(s => s.job_together_photo_url);
  const tradeLabels = {
    electrician: 'Electrician',
    plumber: 'Plumber',
    carpenter: 'Carpenter',
    hvac: 'HVAC Technician',
    mason: 'Mason',
    roofer: 'Roofer',
    painter: 'Painter',
    welder: 'Welder',
    tiler: 'Tiler',
    landscaper: 'Landscaper',
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h2>
        <div className="space-y-4">
          {profile?.location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-500">Location</div>
                <div className="font-medium text-slate-900">{profile.location}</div>
              </div>
            </div>
          )}

          {profile?.bio && (
            <div>
              <div className="text-sm text-slate-500 mb-1">About</div>
              <p className="text-slate-700">{profile.bio}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Job History</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-slate-500">Jobs Posted</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {profile?.total_jobs_posted || jobCount || 0}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-500">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ${(profile?.total_spent || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-slate-500">Avg Rating</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">4.8</div>
          </div>
        </div>
      </Card>

      {togetherPhotos.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-500" />
            On-Site Job Photos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {togetherPhotos.map(scope => (
              <div key={scope.id} className="relative rounded-lg overflow-hidden aspect-square">
                <img
                  src={scope.job_together_photo_url}
                  alt={scope.job_title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{scope.job_title}</p>
                  <p className="text-white/70 text-xs">with {scope.contractor_name}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(profile?.preferred_contractor_types?.length > 0 || profile?.preferred_trades?.length > 0) && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contractor Preferences
          </h2>

          <div className="space-y-4">
            {profile?.preferred_contractor_types?.length > 0 && (
              <div>
                <div className="text-sm text-slate-500 mb-2">Preferred Types</div>
                <div className="flex flex-wrap gap-2">
                  {profile.preferred_contractor_types.map((type, idx) => (
                    <Badge key={idx} variant="secondary">
                      {type === 'general' ? 'General Contractors' : 'Trade Specialists'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile?.preferred_trades?.length > 0 && (
              <div>
                <div className="text-sm text-slate-500 mb-2">Preferred Trades</div>
                <div className="flex flex-wrap gap-2">
                  {profile.preferred_trades.map((trade, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tradeLabels[trade] || trade}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}