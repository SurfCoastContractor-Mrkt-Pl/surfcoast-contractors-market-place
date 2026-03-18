import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import ProfileSwitcher from '@/components/dashboard/ProfileSwitcher';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [activeProfile, setActiveProfile] = useState(null);
  const [profiles, setProfiles] = useState({ customer: false, contractor: false, marketshop: false });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) { navigate('/'); return; }

        const [contractors, customers, shops] = await Promise.all([
          base44.entities.Contractor.filter({ email: user.email }),
          base44.entities.CustomerProfile.filter({ email: user.email }),
          base44.entities.MarketShop.filter({ email: user.email }),
        ]);

        const hasContractor = contractors && contractors.length > 0;
        const hasMarketShop = shops && shops.length > 0;
        const primaryType = hasContractor ? 'contractor' : 'customer';

        setProfiles({ customer: !hasContractor, contractor: hasContractor, marketshop: hasMarketShop, primaryType, hasMarketShop });
        setActiveProfile(primaryType);
      } catch (error) {
        console.error('Dashboard load error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ProfileSwitcher activeProfile={activeProfile} primaryType={profiles.primaryType} hasMarketShop={profiles.hasMarketShop} />
      {activeProfile === 'contractor' && <ContractorDashboard />}
      {activeProfile === 'customer' && <CustomerDashboard />}
    </div>
  );
}