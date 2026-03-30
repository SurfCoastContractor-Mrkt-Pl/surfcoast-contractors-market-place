import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Mail, Trash2, BarChart3, Award, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function TeamManagementHub({ contractorId, contractorEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'collaborator',
    splitPercentage: 10,
  });

  const queryClient = useQueryClient();

  // Fetch team members from a hypothetical Team entity
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', contractorId],
    queryFn: async () => {
      // This would query a team members table/entity in a production scenario
      return [];
    },
    enabled: !!contractorId,
  });

  const { data: contractor } = useQuery({
    queryKey: ['contractor-team', contractorId],
    queryFn: () => base44.entities.Contractor.filter({ email: contractorEmail }),
    enabled: !!contractorId && !!contractorEmail,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      // In production, this would create a team member record and send invitation
      await base44.integrations.Core.SendEmail({
        to: data.email,
        subject: `You've been invited to join ${contractor?.[0]?.name || 'a contractor'}'s team`,
        body: `You've been invited to join as a ${data.role} on the team. ${data.splitPercentage}% of earnings will go to you for jobs you help complete. Accept the invitation in your dashboard.`,
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', contractorId] });
      resetForm();
      setIsOpen(false);
    },
  });

  const handleSubmit = () => {
    if (formData.name && formData.email) {
      inviteMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'collaborator',
      splitPercentage: 10,
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600">Team Size</p>
              <p className="text-2xl font-bold text-slate-900">{teamMembers?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600">Pending Invites</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
            <Mail className="w-8 h-8 text-orange-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600">Team Earnings</p>
              <p className="text-2xl font-bold text-green-600">$0</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Add Team Member */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
            <p className="text-xs text-slate-500 mt-1">Invite team members and delegate work</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" style={{ backgroundColor: '#1E5A96' }}>
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>Add a collaborator or team member to your business.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="collaborator">Collaborator</option>
                    <option value="apprentice">Apprentice</option>
                    <option value="helper">Helper</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Earnings Split: {formData.splitPercentage}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={formData.splitPercentage}
                    onChange={(e) => setFormData({ ...formData, splitPercentage: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    They'll receive {formData.splitPercentage}% of earnings on jobs they help complete
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={inviteMutation.isPending}
                    className="flex-1 text-white"
                    style={{ backgroundColor: '#1E5A96' }}
                  >
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {teamMembers && teamMembers.length > 0 ? (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                    <span className="text-xs text-slate-500">{member.splitPercentage}% split</span>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No team members yet</p>
            <p className="text-slate-400 text-xs mt-1">Invite team members to delegate work and grow your business</p>
          </div>
        )}
      </Card>

      {/* Team Performance */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Team Performance
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Combined Jobs Completed</span>
              <span className="font-semibold text-slate-900">0</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Team Avg Rating</span>
              <span className="font-semibold text-slate-900">—</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Total Team Earnings</span>
              <span className="font-semibold text-green-600">$0</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Why Build a Team?
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>✅ <strong>Scale your business:</strong> Take on more jobs without burning out</li>
          <li>✅ <strong>Flexible delegation:</strong> Choose which jobs to assign to team members</li>
          <li>✅ <strong>Fair earnings split:</strong> Set custom percentages per role</li>
          <li>✅ <strong>Team branding:</strong> Build a unified business identity</li>
          <li>✅ <strong>Unified ratings:</strong> All team work contributes to your business rating</li>
        </ul>
      </Card>

      {/* Info */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Team members must accept their invitation and complete identity verification before they can work on jobs. You remain responsible for all team work.
        </p>
      </Card>
    </div>
  );
}