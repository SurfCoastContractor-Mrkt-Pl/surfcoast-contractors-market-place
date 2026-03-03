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
import { HardHat, Trash2, Search, CheckCircle2, Clock, CalendarCheck } from 'lucide-react';

export default function ContractorAccount() {
  const [searchEmail, setSearchEmail] = useState('');
  const [searched, setSearched] = useState(false);
  const queryClient = useQueryClient();

  const { data: contractors, isLoading } = useQuery({
    queryKey: ['my-contractor', searchEmail],
    queryFn: () => base44.entities.Contractor.filter({ email: searchEmail }),
    enabled: searched && !!searchEmail,
  });

  const { data: payments } = useQuery({
    queryKey: ['contractor-payments', searchEmail],
    queryFn: () => base44.entities.Payment.filter({ payer_email: searchEmail, payer_type: 'contractor' }),
    enabled: searched && !!searchEmail,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contractor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
    },
  });

  const contractor = contractors?.[0];

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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Email Lookup */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Look Up Your Profile</h2>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your registered email"
              value={searchEmail}
              onChange={(e) => { setSearchEmail(e.target.value); setSearched(false); }}
              className="flex-1"
            />
            <Button
              onClick={() => setSearched(true)}
              disabled={!searchEmail}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              <Search className="w-4 h-4 mr-2" />
              Find
            </Button>
          </div>
        </Card>

        {searched && !isLoading && !contractor && (
          <Card className="p-6 text-center text-slate-500">No contractor profile found for that email.</Card>
        )}

        {contractor && (
          <>
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

            {/* Payment History */}
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
                      onClick={() => deleteMutation.mutate(contractor.id)}
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
      </div>
    </div>
  );
}