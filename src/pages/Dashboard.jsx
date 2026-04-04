import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { designTokens } from '@/lib/designTokens';
import { useUserData, useUserProfiles } from '@/hooks/useUserData';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, isLoading: loadingUser } = useUserData();
  const { isContractor, isLoading: loadingProfiles } = useUserProfiles(user?.email);

  const isAdmin = user?.role === 'admin';
  const loading = loadingUser || loadingProfiles;
  const activeProfile = isContractor ? 'contractor' : 'client';

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loadingUser && !user) {
      base44.auth.redirectToLogin('/Dashboard');
    }
  }, [loadingUser, user]);

  const { data: stripeAccounts = [] } = useQuery({
    queryKey: ['stripe-accounts-admin'],
    queryFn: () => base44.entities.Contractor.filter({ stripe_account_setup_complete: true }),
    enabled: isAdmin && !loading,
  });

  const { data: lockedAccounts = [] } = useQuery({
    queryKey: ['locked-accounts-admin'],
    queryFn: () => base44.entities.Contractor.filter({ account_locked: true }),
    enabled: isAdmin && !loading,
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: designTokens.colors.background }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: designTokens.colors.gray[300] }} />
      </div>
    );
  }

   return (
     <div className="w-full">

       {activeProfile === 'contractor' && <ContractorDashboard user={user} />}
       {activeProfile === 'client' && <CustomerDashboard user={user} />}

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