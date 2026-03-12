import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader } from 'lucide-react';
import ReferralDashboard from '../components/referral/ReferralDashboard';

export default function Referrals() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Not authenticated');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Sign in to view your referrals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Earn Credits</h1>
          <p className="text-lg text-slate-600">
            Invite friends and earn $50 credit for every friend who completes their first job
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <ReferralDashboard userEmail={user.email} />
      </div>
    </div>
  );
}