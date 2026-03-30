import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ROLES = ['viewer', 'editor', 'admin'];

export default function TeamMemberManager({ scopeId, isContractor, userEmail }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const queryClient = useQueryClient();

  // Fetch team members (stored in custom entity or as metadata)
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['teamMembers', scopeId],
    queryFn: async () => {
      // This would fetch from a TeamMember entity if created
      // For now, returning empty as it requires a new entity
      return [];
    },
    enabled: !!scopeId && isContractor,
  });

  const inviteMutation = useMutation({
    mutationFn: async (memberData) => {
      // Would create team member record and send invite email
      return { success: true, member: memberData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', scopeId] });
      setEmail('');
      setRole('viewer');
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId) => {
      // Would delete team member record
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', scopeId] });
    },
  });

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email');
      return;
    }
    
    inviteMutation.mutate({
      scope_id: scopeId,
      email,
      role,
      invited_by: userEmail,
      invited_at: new Date().toISOString(),
    });
  };

  if (!isContractor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Only contractors can manage team members.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" /> Team Members
        </CardTitle>
        <CardDescription>Manage project access and roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite Form */}
        <div className="space-y-3 pb-4 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              type="email"
              placeholder="Team member email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={inviteMutation.isPending}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              disabled={inviteMutation.isPending}
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            <Button
              onClick={handleInvite}
              disabled={!email || inviteMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {inviteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" /> Invite
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Team Members List */}
        {isLoading ? (
          <div className="text-center py-4">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
          </div>
        ) : teamMembers.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No team members added yet</p>
        ) : (
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{member.email}</p>
                    <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeMutation.mutate(member.id)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                  disabled={removeMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}