import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Bot } from 'lucide-react';

const severityColors = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-slate-100 text-slate-500',
};

export default function AgentReportsTable() {
  const [expanded, setExpanded] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['agent-reports'],
    queryFn: () => base44.entities.AgentReport.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AgentReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-reports'] });
      setAdminNote('');
    },
  });

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <Bot className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-400">No AI assistant reports yet.</p>
        <p className="text-xs text-slate-400 mt-1">Reports appear here when users escalate platform issues through the AI assistant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map(report => (
        <div
          key={report.id}
          className={`rounded-xl border p-4 ${report.status === 'new' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-slate-900 text-sm truncate">{report.summary}</span>
                {report.status === 'new' && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                <span>{report.user_identifier || 'guest'}</span>
                <span>·</span>
                <Badge className={`text-xs ${severityColors[report.severity] || severityColors.medium}`}>{report.severity}</Badge>
                <Badge className={`text-xs capitalize ${statusColors[report.status] || ''}`}>{report.status}</Badge>
                <Badge className="text-xs bg-slate-100 text-slate-600 capitalize">{report.issue_type?.replace('_', ' ')}</Badge>
                <span>· {new Date(report.created_date).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => setExpanded(expanded === report.id ? null : report.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              {expanded === report.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expanded === report.id && (
            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              {report.full_context && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Context / Transcript</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-200">{report.full_context}</p>
                </div>
              )}
              {report.admin_notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Admin Notes</p>
                  <p className="text-sm text-slate-700 bg-amber-50 rounded-lg p-3 border border-amber-200">{report.admin_notes}</p>
                </div>
              )}

              <div>
                <Textarea
                  placeholder="Add admin notes..."
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  className="text-sm mb-2"
                  rows={2}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => updateMutation.mutate({ id: report.id, data: { status: 'reviewed', admin_notes: adminNote || report.admin_notes } })}
                    disabled={updateMutation.isPending}
                  >
                    Mark Reviewed
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateMutation.mutate({ id: report.id, data: { status: 'resolved', admin_notes: adminNote || report.admin_notes } })}
                    disabled={updateMutation.isPending}
                  >
                    Mark Resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-slate-400"
                    onClick={() => updateMutation.mutate({ id: report.id, data: { status: 'dismissed', admin_notes: adminNote || report.admin_notes } })}
                    disabled={updateMutation.isPending}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}