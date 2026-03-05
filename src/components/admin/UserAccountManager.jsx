import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, Lock, Unlock, Key, AlertTriangle } from 'lucide-react';

export default function UserAccountManager({ user, userType, onClose }) {
  const [action, setAction] = useState(null);
  const [data, setData] = useState({});
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (userType === 'contractor') {
        return base44.asServiceRole.entities.Contractor.update(user.id, { identity_verified: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contractors', 'admin-customers'] });
      setAction(null);
    }
  });

  const suspendMutation = useMutation({
    mutationFn: async () => {
      if (userType === 'contractor') {
        return base44.asServiceRole.entities.Contractor.update(user.id, { account_locked: true, locked_scope_id: data.reason });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contractors'] });
      setAction(null);
    }
  });

  const unsuspendMutation = useMutation({
    mutationFn: async () => {
      if (userType === 'contractor') {
        return base44.asServiceRole.entities.Contractor.update(user.id, { account_locked: false, locked_scope_id: null });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contractors'] });
      setAction(null);
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      return base44.integrations.Core.SendEmail({
        to: user.email,
        subject: data.emailSubject,
        body: data.emailBody
      });
    },
    onSuccess: () => {
      setAction(null);
      setData({});
    }
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      if (userType === 'contractor') {
        return base44.asServiceRole.entities.Contractor.update(user.id, editData);
      } else {
        return base44.asServiceRole.entities.CustomerProfile.update(user.id, editData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contractors', 'admin-customers'] });
      setAction(null);
      setEditData({});
    }
  });

  const openEdit = () => {
    setEditData({
      name: user.name || user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      photo_url: user.photo_url || '',
    });
    setAction('edit');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const response = await base44.integrations.Core.UploadFile({ file });
      setEditData({ ...editData, photo_url: response.file_url });
    }
  };

  return (
    <>
      <Card className="p-4 space-y-4 border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">{user.name || user.full_name}</h3>
            <p className="text-xs text-slate-500 mb-1">{user.email}</p>
            <div className="flex gap-2 mt-2">
              {user.identity_verified && (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                </Badge>
              )}
              {user.account_locked && (
                <Badge className="bg-red-100 text-red-700 text-xs">
                  <Lock className="w-3 h-3 mr-1" /> Suspended
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={openEdit}
            className="w-full justify-start text-xs"
          >
            Edit Profile
          </Button>

           {!user.identity_verified && (
             <Button
               size="sm"
               variant="outline"
               onClick={() => setAction('verify')}
               className="w-full justify-start text-xs"
             >
               <CheckCircle2 className="w-3 h-3 mr-2" />
               Verify Identity
             </Button>
           )}

          {user.account_locked ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAction('unsuspend')}
              className="w-full justify-start text-xs text-green-600 hover:text-green-700"
            >
              <Unlock className="w-3 h-3 mr-2" />
              Unsuspend Account
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAction('suspend')}
              className="w-full justify-start text-xs text-red-600 hover:text-red-700"
            >
              <Lock className="w-3 h-3 mr-2" />
              Suspend Account
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAction('sendEmail')}
            className="w-full justify-start text-xs"
          >
            <Key className="w-3 h-3 mr-2" />
            Send Message
          </Button>
        </div>
      </Card>

      {/* Verify Dialog */}
      <Dialog open={action === 'verify'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Identity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Confirming identity verification for {user.name || user.full_name}. They will be notified.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Confirm Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={action === 'suspend'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Suspend Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Suspending this account will prevent {user.name || user.full_name} from accessing the platform.
            </p>
            <div>
              <Label className="text-sm font-medium">Reason (optional)</Label>
              <Textarea
                placeholder="Document why this account is being suspended..."
                value={data.reason || ''}
                onChange={(e) => setData({ ...data, reason: e.target.value })}
                rows={3}
                className="mt-1 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button
              onClick={() => suspendMutation.mutate()}
              disabled={suspendMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {suspendMutation.isPending ? 'Suspending...' : 'Suspend Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsuspend Dialog */}
      <Dialog open={action === 'unsuspend'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsuspend Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              This will restore {user.name || user.full_name}'s access to the platform.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button
              onClick={() => unsuspendMutation.mutate()}
              disabled={unsuspendMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {unsuspendMutation.isPending ? 'Unsuspending...' : 'Unsuspend Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={action === 'edit'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Profile Picture</Label>
              <div className="mt-2 flex items-center gap-4">
                {editData.photo_url && (
                  <img src={editData.photo_url} alt="Profile" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">{userType === 'contractor' ? 'Name' : 'Full Name'}</Label>
              <Input
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input
                type="email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <Input
                type="tel"
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <Input
                value={editData.location || ''}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Bio</Label>
              <Textarea
                value={editData.bio || ''}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={action === 'sendEmail'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Subject</Label>
              <Input
                placeholder="Email subject"
                value={data.emailSubject || ''}
                onChange={(e) => setData({ ...data, emailSubject: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Message</Label>
              <Textarea
                placeholder="Write your message..."
                value={data.emailBody || ''}
                onChange={(e) => setData({ ...data, emailBody: e.target.value })}
                rows={5}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button
              onClick={() => sendEmailMutation.mutate()}
              disabled={sendEmailMutation.isPending || !data.emailSubject || !data.emailBody}
            >
              {sendEmailMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}