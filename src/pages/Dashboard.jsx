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
      <div style={{ minHeight: "100vh", background: "#EBEBEC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #D0D0D2", borderTop: "3px solid #5C3500", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

   return (
     <div style={{ minHeight: "100vh", background: "#EBEBEC", fontFamily: "system-ui, -apple-system, sans-serif" }}>

       {activeProfile === 'contractor' && <ContractorDashboard user={user} />}
       {activeProfile === 'client' && <CustomerDashboard user={user} />}

       {isAdmin && (
         <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
           <div style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 11, color: "#555", letterSpacing: "0.12em", marginBottom: 20 }}>// ADMIN — ACCOUNT OVERVIEW</div>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>
             <div style={{ background: "#fff", border: "0.5px solid #D0D0D2", borderRadius: 10, boxShadow: "3px 3px 0px #5C3500", padding: 24 }}>
               <div style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 10, color: "#555", marginBottom: 12, letterSpacing: "0.06em" }}>// STRIPE ACCOUNTS</div>
               <p style={{ fontSize: 12, color: "#777", fontStyle: "italic", marginBottom: 16 }}>Contractors with Stripe setup</p>
               {stripeAccounts.length === 0 ? (
                 <p style={{ color: "#999", fontSize: 13, fontStyle: "italic" }}>No Stripe accounts configured</p>
               ) : (
                 <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                   {stripeAccounts.map(contractor => (
                     <div key={contractor.id} style={{ border: "0.5px solid #D0D0D2", borderRadius: 6, padding: "12px 14px" }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                         <div>
                           <div style={{ fontWeight: 700, color: "#1A1A1B", fontSize: 13 }}>{contractor.name}</div>
                           <div style={{ color: "#777", fontSize: 12 }}>{contractor.email}</div>
                         </div>
                         <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 10, padding: "3px 8px", borderRadius: 4, background: contractor.stripe_account_charges_enabled ? "#dcfce7" : "#fee2e2", color: contractor.stripe_account_charges_enabled ? "#166534" : "#991b1b" }}>
                           {contractor.stripe_account_charges_enabled ? '✅ Enabled' : '⛔ Disabled'}
                         </span>
                       </div>
                       <p style={{ fontSize: 11, color: "#999", fontStyle: "italic" }}>ID: {contractor.stripe_connected_account_id}</p>
                     </div>
                   ))}
                 </div>
               )}
             </div>

             <div style={{ background: "#fff", border: "0.5px solid #D0D0D2", borderRadius: 10, boxShadow: "3px 3px 0px #5C3500", padding: 24 }}>
               <div style={{ fontFamily: "monospace", fontWeight: 700, fontStyle: "italic", fontSize: 10, color: "#555", marginBottom: 12, letterSpacing: "0.06em" }}>// LOCKED ACCOUNTS</div>
               <p style={{ fontSize: 12, color: "#777", fontStyle: "italic", marginBottom: 16 }}>Suspended contractor accounts</p>
               {lockedAccounts.length === 0 ? (
                 <p style={{ color: "#999", fontSize: 13, fontStyle: "italic" }}>No locked accounts</p>
               ) : (
                 <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                   {lockedAccounts.map(contractor => (
                     <div key={contractor.id} style={{ border: "0.5px solid #D0D0D2", borderRadius: 6, padding: "12px 14px" }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                         <div>
                           <div style={{ fontWeight: 700, color: "#1A1A1B", fontSize: 13 }}>{contractor.name}</div>
                           <div style={{ color: "#777", fontSize: 12 }}>{contractor.email}</div>
                         </div>
                         <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "#fee2e2", color: "#991b1b" }}>🔒 Locked</span>
                       </div>
                       {contractor.locked_scope_id && (
                         <p style={{ fontSize: 11, color: "#999", fontStyle: "italic" }}>Scope ID: {contractor.locked_scope_id}</p>
                       )}
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
     </div>
   );
  }