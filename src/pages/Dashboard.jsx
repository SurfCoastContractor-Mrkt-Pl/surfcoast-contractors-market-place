import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [activeProfile, setActiveProfile] = useState(null);
  const [profiles, setProfiles] = useState({ customer: false, contractor: false, marketshop: false });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Must be declared before any conditional returns (Rules of Hooks)
  const { data: stripeAccounts = [] } = useQuery({
    queryKey: ['stripe-accounts-admin'],
    queryFn: () => base44.entities.Contractor.filter({ stripe_account_setup_complete: true }),
    enabled: !!profiles.primaryType && user?.role === 'admin',
  });

  const { data: lockedAccounts = [] } = useQuery({
    queryKey: ['locked-accounts-admin'],
    queryFn: () => base44.entities.Contractor.filter({ account_locked: true }),
    enabled: !!profiles.primaryType && user?.role === 'admin',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (!currentUser) { base44.auth.redirectToLogin('/Dashboard'); return; }

        // Fetch each independently so one failure doesn't block the others
        const [contractors, customers, shops] = await Promise.all([
          base44.entities.Contractor.filter({ email: currentUser.email }).catch(() => []),
          base44.entities.CustomerProfile.filter({ email: currentUser.email }).catch(() => []),
          base44.entities.MarketShop.filter({ email: currentUser.email }).catch(() => []),
        ]);

        const hasContractor = contractors && contractors.length > 0;
        const hasMarketShop = shops && shops.length > 0;
        const primaryType = hasContractor ? 'contractor' : 'customer';

        setProfiles({ customer: !hasContractor, contractor: hasContractor, marketshop: hasMarketShop, primaryType, hasMarketShop });
        setActiveProfile(primaryType);
      } catch (error) {
        console.error('Dashboard load error:', error);
        if (error?.status === 401 || error?.status === 403) {
          base44.auth.redirectToLogin('/Dashboard');
        } else {
          // Non-auth error: default to customer view so something renders
          setActiveProfile('customer');
          setProfiles({ customer: true, contractor: false, marketshop: false, primaryType: 'customer', hasMarketShop: false });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

   return (
     <div className="min-h-screen bg-slate-50">
       <ProfileSwitcher activeProfile={activeProfile} primaryType={profiles.primaryType} hasMarketShop={profiles.hasMarketShop} />
       {activeProfile === 'contractor' && <ContractorDashboard />}
       {activeProfile === 'customer' && <CustomerDashboard />}

       {isAdmin && (
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Stripe Accounts Section */}
             <Card>
               <CardHeader>
                 <CardTitle>Stripe Accounts</CardTitle>
                 <CardDescription>Contractors with Stripe setup</CardDescription>
               </CardHeader>
               <CardContent>
                 {stripeAccounts.length === 0 ? (
                   <p className="text-slate-500 text-sm">No Stripe accounts configured</p>
                 ) : (
                   <div className="space-y-4">
                     {stripeAccounts.map(contractor => (
                       <div key={contractor.id} className="border border-slate-200 rounded-lg p-4">
                         <div className="flex justify-between items-start mb-2">
                           <div>
                             <h4 className="font-semibold text-slate-900">{contractor.name}</h4>
                             <p className="text-sm text-slate-600">{contractor.email}</p>
                           </div>
                           <Badge className={contractor.stripe_account_charges_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                             {contractor.stripe_account_charges_enabled ? '✅ Payouts Enabled' : '⛔ Payouts Disabled'}
                           </Badge>
                         </div>
                         <p className="text-xs text-slate-500 mt-2">ID: {contractor.stripe_connected_account_id}</p>
                       </div>
                     ))}
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* Locked Accounts Section */}
             <Card>
               <CardHeader>
                 <CardTitle>Locked Accounts</CardTitle>
                 <CardDescription>Suspended contractor accounts</CardDescription>
               </CardHeader>
               <CardContent>
                 {lockedAccounts.length === 0 ? (
                   <p className="text-slate-500 text-sm">No locked accounts</p>
                 ) : (
                   <div className="space-y-4">
                     {lockedAccounts.map(contractor => (
                       <div key={contractor.id} className="border border-slate-200 rounded-lg p-4">
                         <div className="flex justify-between items-start mb-2">
                           <div>
                             <h4 className="font-semibold text-slate-900">{contractor.name}</h4>
                             <p className="text-sm text-slate-600">{contractor.email}</p>
                           </div>
                           <Badge className="bg-red-100 text-red-800">🔒 Locked</Badge>
                         </div>
                         {contractor.locked_scope_id && (
                           <p className="text-xs text-slate-500 mt-2">Scope ID: {contractor.locked_scope_id}</p>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
               </CardContent>
             </Card>
           </div>
         </div>
       )}
     </div>
   );
  }