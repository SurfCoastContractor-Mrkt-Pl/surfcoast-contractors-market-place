import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardHat, Trash2, Search, CheckCircle2, Clock, CalendarCheck, FileText, LogOut, Settings, Lock, Mail, Edit2, X } from 'lucide-react';
import SecurityInfoPanel from '@/components/security/SecurityInfoPanel';
import { Textarea } from '@/components/ui/textarea';
import AccountLockedBanner from '@/components/contractor/AccountLockedBanner';
import JobCloseout from '@/components/scopeofwork/JobCloseout.jsx';
import PortfolioDisplay from '@/components/contractor/PortfolioDisplay';
import EquipmentDisplay from '@/components/contractor/EquipmentDisplay';
import SavedPaymentMethods from '@/components/payment/SavedPaymentMethods';
import ContractorBadges from '@/components/badges/ContractorBadges';

export default function ContractorAccount() {
  const [closeoutScope, setCloseoutScope] = useState(null);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin();
          return;
        }
        setUserEmail(user.email);
      } catch (error) {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: contractors, isLoading } = useQuery({
    queryKey: ['my-contractor', userEmail],
    queryFn: () => base44.entities.Contractor.filter({ email: userEmail }),
    enabled: !!userEmail,
  });

  const contractor = contractors?.[0];

  const { data: payments } = useQuery({
    queryKey: ['contractor-payments', userEmail],
    queryFn: () => base44.entities.Payment.filter({ payer_email: userEmail, payer_type: 'contractor' }),
    enabled: !!userEmail,
  });

  const { data: lockedScope } = useQuery({
    queryKey: ['locked-scope', contractor?.locked_scope_id],
    queryFn: async () => {
      const results = await base44.entities.ScopeOfWork.filter({ id: contractor.locked_scope_id });
      return results[0];
    },
    enabled: !!contractor?.locked_scope_id && !!contractor?.account_locked,
  });

  const { data: contractorScopes } = useQuery({
    queryKey: ['contractor-scopes', contractor?.id],
    queryFn: () => base44.entities.ScopeOfWork.filter({ contractor_id: contractor?.id }),
    enabled: !!contractor?.id,
  });

  const { data: pastWorkPayments } = useQuery({
    queryKey: ['contractor-past-work', contractor?.id],
    queryFn: () => base44.entities.Payment.filter({ contractor_id: contractor?.id, status: 'work_scheduled' }),
    enabled: !!contractor?.id,
  });

  const updateBioMutation = useMutation({
    mutationFn: async (bioData) => {
      return base44.entities.Contractor.update(contractor.id, bioData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contractor', userEmail] });
      setEditingBio(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (email) => {
      await base44.functions.invoke('deleteAccountCascading', {
        accountType: 'contractor',
        accountEmail: email,
      });
    },
    onSuccess: () => {
      base44.auth.logout();
    },
  });

  const handleBioEdit = () => {
    setBioText(contractor?.bio || '');
    setEditingBio(true);
  };

  const handleBioSave = () => {
    updateBioMutation.mutate({ bio: bioText });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4">
            <HardHat className="w-6 h-6 text-slate-900 animate-spin" />
          </div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
              <HardHat className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Contractor Account</h1>
              <p className="text-slate-300">Manage your contractor profile</p>
            </div>
          </div>
        </div>
      </div>

      <JobCloseout scope={closeoutScope} role="contractor" open={!!closeoutScope} onClose={() => { setCloseoutScope(null); queryClient.invalidateQueries({ queryKey: ['contractor-scopes', contractor?.id] }); }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
         {/* Auth Button */}
         <div className="flex gap-3">
           <Button
             variant="outline"
             onClick={() => base44.auth.logout()}
           >
             <LogOut className="w-4 h-4 mr-2" />
             Logout
           </Button>
         </div>

         {contractor && (
          <>
            {/* Locked Account Banner */}
            {contractor.account_locked && (
              <AccountLockedBanner contractor={contractor} lockedScope={lockedScope} />
            )}

            {/* Profile Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Profile</h2>
              <div className="flex items-center gap-4">
                {contractor.photo_url ? (
                  <img src={contractor.photo_url} alt={contractor.name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                    {contractor.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900 text-lg">{contractor.name}</div>
                  <div className="text-slate-500 text-sm">{contractor.email}</div>
                  <div className="text-slate-500 text-sm">{contractor.location}</div>
                  <Badge className={contractor.available ? 'bg-green-100 text-green-700 mt-1' : 'bg-slate-100 text-slate-500 mt-1'}>
                    {contractor.available ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>
            </Card>

            <Tabs defaultValue="profile">
              <TabsList className="w-full grid-cols-6">
                <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
                <TabsTrigger value="badges" className="text-xs sm:text-sm">Badges</TabsTrigger>
                <TabsTrigger value="fees" className="text-xs sm:text-sm">Fees</TabsTrigger>
                <TabsTrigger value="scopes" className="text-xs sm:text-sm flex items-center gap-1.5">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />Scopes
                  {contractorScopes?.filter(s => s.status !== 'closed').length > 0 && (
                    <span className="ml-0.5 bg-amber-100 text-amber-700 text-xs rounded-full px-1">{contractorScopes.filter(s => s.status !== 'closed').length}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm flex items-center gap-1.5"><Settings className="w-3 h-3 sm:w-4 sm:h-4" />Settings</TabsTrigger>
                <TabsTrigger value="past-work" className="text-xs sm:text-sm flex items-center gap-1.5">
                  <CalendarCheck className="w-3 h-3 sm:w-4 sm:h-4" />Work
                  {pastWorkPayments?.length > 0 && (
                    <span className="ml-0.5 bg-green-100 text-green-700 text-xs rounded-full px-1">{pastWorkPayments.length}</span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="space-y-4">
                  {/* About Me Section */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-slate-900">About Me</h2>
                      {!editingBio && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBioEdit}
                          className="gap-1.5"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                    </div>

                    {editingBio ? (
                      <div className="space-y-3">
                        <Textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          placeholder="Tell potential customers about yourself, your experience, expertise, and what makes you stand out..."
                          rows={6}
                          className="resize-none"
                        />
                        <p className="text-xs text-slate-500">
                          This section helps customers understand your background and decide if you're the right fit for their project.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleBioSave}
                            className="bg-amber-500 hover:bg-amber-600"
                            disabled={updateBioMutation.isPending}
                          >
                            {updateBioMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingBio(false)}
                            disabled={updateBioMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {contractor?.bio ? (
                          <p className="text-slate-600 whitespace-pre-wrap">{contractor.bio}</p>
                        ) : (
                          <p className="text-slate-400 italic">No bio added yet. Tell customers about yourself to help them choose you for their projects.</p>
                        )}
                      </div>
                    )}
                  </Card>

                  <PortfolioDisplay contractorId={contractor?.id} isOwner={true} />
                  <EquipmentDisplay contractorId={contractor?.id} isOwner={true} />
                </div>
              </TabsContent>

              <TabsContent value="scopes">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Scope of Work Agreements</h2>
                  {contractorScopes?.length > 0 ? (
                    <div className="space-y-3">
                      {contractorScopes.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-800 truncate">{s.job_title}</div>
                              <div className="text-xs text-slate-500">Customer: {s.customer_name} — {s.cost_type === 'fixed' ? `$${s.cost_amount} fixed` : `$${s.cost_amount}/hr`}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={
                              s.status === 'closed' ? 'bg-slate-100 text-slate-600' :
                              s.status === 'approved' ? 'bg-green-100 text-green-700' :
                              s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }>
                              {s.status === 'pending_approval' ? 'Pending' : s.status}
                            </Badge>
                            {s.status !== 'closed' && s.status !== 'rejected' && (
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-green-300 text-green-700 hover:bg-green-50" onClick={() => setCloseoutScope(s)}>
                                <LogOut className="w-3 h-3 mr-1" /> Close Out
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No scope of work agreements yet.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="badges">
                <ContractorBadges completedJobsCount={contractor?.completed_jobs_count || 0} uniqueCustomersCount={contractor?.unique_customers_count || 0} />
              </TabsContent>

              <TabsContent value="fees">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Platform Fee Status</h2>
                  {payments?.length > 0 ? (
                    <div className="space-y-3">
                      {payments.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {p.status === 'confirmed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-amber-500" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-slate-800">${p.amount.toFixed(2)} — {p.purpose}</div>
                              <div className="text-xs text-slate-500">{new Date(p.created_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <Badge className={p.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                            {p.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No platform fee payments found.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-4">
                  {/* Payment Methods */}
                  {userEmail && <SavedPaymentMethods userEmail={userEmail} />}

                  {/* Privacy & Security Info */}
                  <SecurityInfoPanel />

                  {/* Account Security */}
                  <Card className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Lock className="w-5 h-5 text-slate-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-900">Account Security</h3>
                        <p className="text-sm text-slate-500">Your login credentials are managed by SurfCoast's secure authentication system.</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full"
                    >
                      Change Password
                    </Button>
                    <p className="text-xs text-slate-400 mt-2">You'll be securely logged out and directed to reset your password.</p>
                  </Card>

                  {/* Email Preferences */}
                  <Card className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-900">Contact Email</h3>
                        <p className="text-sm text-slate-500">{contractor?.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">All notifications and communications are sent to this email address. To change it, you'll need to contact support.</p>
                    <Button variant="outline" disabled className="w-full opacity-50">
                      Update Email (Coming Soon)
                    </Button>
                  </Card>

                  {/* Logout */}
                  <Card className="p-6 bg-slate-50">
                    <h3 className="font-semibold text-slate-900 mb-2">Session</h3>
                    <p className="text-sm text-slate-500 mb-4">Log out from your account on this device.</p>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => base44.auth.logout()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="past-work">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Past Work</h2>
                  <p className="text-xs text-slate-500 mb-4">Jobs that were marked as "Work Scheduled" — completed engagements.</p>
                  {pastWorkPayments?.length > 0 ? (
                    <div className="space-y-3">
                      {pastWorkPayments.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <CalendarCheck className="w-5 h-5 text-green-600 shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-slate-800">{p.purpose || 'Job engagement'}</div>
                              <div className="text-xs text-slate-500">Customer: {p.payer_name} · {p.payer_email}</div>
                              <div className="text-xs text-slate-400">{new Date(p.updated_date || p.created_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Completed</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No completed work yet.</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            {/* Contractor Badges */}
             <ContractorBadges completedJobsCount={contractor?.completed_jobs_count || 0} uniqueCustomersCount={contractor?.unique_customers_count || 0} />

            {/* Delete Profile */}
             <Card className="p-6 border-red-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Delete Profile</h2>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete your contractor profile. This cannot be undone. All your profile data will be removed from ContractorHub.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Contractor Profile?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your profile for <strong>{contractor.name}</strong>. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => deleteMutation.mutate(contractor.email)}
                    >
                      Yes, Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {deleteMutation.isSuccess && (
                <p className="text-green-700 text-sm mt-3 font-medium">Profile deleted successfully.</p>
              )}
            </Card>
          </>
          )}
          {!contractor && (
          <Card className="p-6 text-center text-slate-500">
            <p>No contractor profile found. Please contact support if you believe this is an error.</p>
          </Card>
          )}
          </div>
          </div>
          );
          }