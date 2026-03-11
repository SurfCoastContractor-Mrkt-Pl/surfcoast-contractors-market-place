import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, FileText, Mail, Loader2 } from 'lucide-react';

const CATEGORY_COLORS = {
  payment_issue: 'bg-red-100 text-red-700',
  work_quality: 'bg-orange-100 text-orange-700',
  timeline_delay: 'bg-yellow-100 text-yellow-700',
  communication_problem: 'bg-blue-100 text-blue-700',
  contract_breach: 'bg-purple-100 text-purple-700',
  safety_concern: 'bg-red-100 text-red-700',
  other: 'bg-slate-100 text-slate-700'
};

const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
};

const STATUS_COLORS = {
  open: 'bg-amber-100 text-amber-700',
  in_review: 'bg-blue-100 text-blue-700',
  under_mediation: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',
  escalated: 'bg-red-100 text-red-700'
};

export default function DisputesTable({ disputes, authed }) {
  const [resolvedDisputes, setResolvedDisputes] = useState({});

  if (!authed || !disputes) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
        Loading disputes...
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <AlertTriangle className="w-5 h-5 mx-auto mb-2 opacity-50" />
        No disputes filed yet.
      </div>
    );
  }

  const handleResolveClick = (dispute) => {
    window.open(`/dispute-center?dispute_id=${dispute.id}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {disputes.map(dispute => (
        <Card
          key={dispute.id}
          className={`p-4 border-l-4 ${
            resolvedDisputes[dispute.id] ? 'border-l-green-500 bg-green-50' : 
            dispute.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
            dispute.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
            'border-l-amber-500 bg-amber-50'
          }`}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h3 className="font-semibold text-slate-900 text-base">{dispute.title}</h3>
                  <Badge className={STATUS_COLORS[dispute.status]}>
                    {dispute.status.replace(/_/g, ' ')}
                  </Badge>
                  <Badge className={SEVERITY_COLORS[dispute.severity]}>
                    {dispute.severity}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{dispute.description}</p>
              </div>
              {!resolvedDisputes[dispute.id] && dispute.status !== 'resolved' && (
                <Button
                  onClick={() => handleResolveClick(dispute)}
                  className="shrink-0 bg-amber-600 hover:bg-amber-700"
                >
                  Resolve
                </Button>
              )}
              {resolvedDisputes[dispute.id] && (
                <Badge className="bg-green-100 text-green-700 shrink-0">
                  ✓ Resolved
                </Badge>
              )}
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4 bg-white/50 rounded-lg p-3">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">INITIATOR</p>
                <p className="font-medium text-slate-900 text-sm">{dispute.initiator_name}</p>
                <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                  <Mail className="w-3 h-3" />
                  {dispute.initiator_email}
                </div>
                <Badge className="mt-2 bg-slate-100 text-slate-700 capitalize text-xs">
                  {dispute.initiator_type}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">RESPONDENT</p>
                <p className="font-medium text-slate-900 text-sm">{dispute.respondent_name}</p>
                <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                  <Mail className="w-3 h-3" />
                  {dispute.respondent_email}
                </div>
                <Badge className="mt-2 bg-slate-100 text-slate-700 capitalize text-xs">
                  {dispute.respondent_type}
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-slate-500 mb-1">Category</p>
                <Badge className={`${CATEGORY_COLORS[dispute.category]} capitalize`}>
                  {dispute.category.replace(/_/g, ' ')}
                </Badge>
              </div>
              {dispute.scope_id && (
                <div>
                  <p className="text-slate-500 mb-1">Scope ID</p>
                  <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 break-all">
                    {dispute.scope_id.substring(0, 8)}...
                  </code>
                </div>
              )}
              {dispute.job_id && (
                <div>
                  <p className="text-slate-500 mb-1">Job ID</p>
                  <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 break-all">
                    {dispute.job_id.substring(0, 8)}...
                  </code>
                </div>
              )}
              <div>
                <p className="text-slate-500 mb-1">Submitted</p>
                <p className="text-slate-700">
                  {new Date(dispute.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Evidence */}
            {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500 font-medium mb-2">EVIDENCE ({dispute.evidence_urls.length})</p>
                <div className="flex flex-wrap gap-2">
                  {dispute.evidence_urls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded border border-slate-200 hover:border-slate-300 text-xs text-slate-600 hover:text-slate-900"
                    >
                      <FileText className="w-3 h-3" />
                      Evidence {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Info */}
            {dispute.status === 'resolved' && dispute.resolution_type && (
              <div className="border-t border-green-200 bg-green-50/50 rounded-lg p-3 mt-3">
                <p className="text-xs text-green-700 font-medium mb-2">RESOLUTION</p>
                <p className="text-sm text-green-800 mb-1">
                  <strong>Type:</strong> {dispute.resolution_type.replace(/_/g, ' ')}
                </p>
                {dispute.resolution_details && (
                  <p className="text-sm text-green-800">
                    <strong>Details:</strong> {dispute.resolution_details}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}

    </div>
  );
}