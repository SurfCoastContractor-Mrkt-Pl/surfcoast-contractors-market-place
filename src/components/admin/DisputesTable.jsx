import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import DisputeDetail from './DisputeDetail';

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const statusColors = {
  open: 'bg-slate-100 text-slate-800',
  in_review: 'bg-blue-100 text-blue-800',
  under_mediation: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-200 text-slate-800',
  escalated: 'bg-red-100 text-red-800'
};

export default function DisputesTable() {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => base44.asServiceRole.entities.Dispute.list()
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.Dispute.update(selectedDispute.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      setShowStatusDialog(false);
      setNewStatus('');
      setAdminNotes('');
      setSelectedDispute(null);
    }
  });

  const filteredDisputes = disputes.filter(d => {
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchSeverity = filterSeverity === 'all' || d.severity === filterSeverity;
    const matchSearch = !searchTerm || 
      d.dispute_number.includes(searchTerm.toUpperCase()) ||
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.initiator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.respondent_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSeverity && matchSearch;
  });

  if (isLoading) return <div className="text-center py-8 text-slate-500">Loading disputes...</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by dispute #, title, or party name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="under_mediation">Under Mediation</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-2">
        {filteredDisputes.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-slate-500">No disputes found</p>
          </div>
        ) : (
          filteredDisputes.map(dispute => (
            <button
              key={dispute.id}
              onClick={() => setSelectedDispute(dispute)}
              className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-slate-900">{dispute.dispute_number}</p>
                    <Badge className={severityColors[dispute.severity]}>
                      {dispute.severity.toUpperCase()}
                    </Badge>
                    <Badge className={statusColors[dispute.status]}>
                      {dispute.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{dispute.title}</p>
                  <p className="text-xs text-slate-500">
                    {dispute.initiator_name} → {dispute.respondent_name} • Category: {dispute.category.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Filed {format(new Date(dispute.submitted_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 mt-1" />
              </div>
            </button>
          ))
        )}
      </div>

      {/* Detail Dialog */}
      {selectedDispute && (
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dispute Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <DisputeDetail dispute={selectedDispute} isAdmin={true} />
              
              {/* Admin Actions */}
              <div className="border-t pt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Status</label>
                  <Select value={selectedDispute.status} onValueChange={(status) => {
                    setNewStatus(status);
                    setShowStatusDialog(true);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="under_mediation">Under Mediation</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                  <Textarea
                    value={adminNotes || selectedDispute.admin_notes || ''}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes only..."
                    className="h-24"
                  />
                </div>

                <Button
                  onClick={() => updateMutation.mutate({
                    status: newStatus || selectedDispute.status,
                    admin_notes: adminNotes || selectedDispute.admin_notes,
                    last_updated_at: new Date().toISOString()
                  })}
                  disabled={updateMutation.isPending}
                  className="w-full"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Dispute'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}