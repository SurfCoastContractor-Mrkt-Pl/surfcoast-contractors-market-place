import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle2 } from 'lucide-react';

export default function ScopeComparison({ customerScopeRequest, contractorProposal }) {
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer's Scope Request */}
        <Card className="p-6 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Customer's Request</h3>
            <Badge className="bg-blue-100 text-blue-700 text-xs">What they need</Badge>
          </div>

          {customerScopeRequest?.scope_details && (
            <div className="mb-4">
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{customerScopeRequest.scope_details}</p>
            </div>
          )}

          {customerScopeRequest?.scope_photo_urls?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Photos:</p>
              <div className="grid grid-cols-2 gap-2">
                {customerScopeRequest.scope_photo_urls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden bg-slate-200 hover:opacity-90 transition"
                  >
                    <img src={url} alt={`Scope ${idx + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Contractor's Proposal */}
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Your Proposal</h3>
            <Badge className="bg-amber-100 text-amber-700 text-xs">Your solution</Badge>
          </div>

          {contractorProposal?.proposal_summary && (
            <div className="mb-4">
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{contractorProposal.proposal_summary}</p>
            </div>
          )}

          {contractorProposal && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Cost Type:</span>
                <span className="font-medium text-slate-900 capitalize">{contractorProposal.cost_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Amount:</span>
                <span className="font-medium text-slate-900">${contractorProposal.cost_amount?.toFixed(2)}</span>
              </div>
              {contractorProposal.estimated_hours && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Est. Hours:</span>
                  <span className="font-medium text-slate-900">{contractorProposal.estimated_hours}h</span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}