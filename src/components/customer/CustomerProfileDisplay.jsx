import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, DollarSign, Star, Users } from 'lucide-react';

export default function CustomerProfileDisplay({ profile, jobCount }) {
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