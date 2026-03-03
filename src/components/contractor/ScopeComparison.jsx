import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

export default function ScopeComparison({ customerScope, contractorScope }) {
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer's Scope */}
        <Card className="p-6 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Customer's Scope</h3>
            <Badge className="bg-blue-100 text-blue-700 text-xs">What they need</Badge>
          </div>

          {customerScope?.customer_scope_details && (
            <div className="mb-4">
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{customerScope.customer_scope_details}</p>
            </div>
          )}

          {customerScope?.customer_scope_photo_urls?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Photos:</p>
              <div className="grid grid-cols-2 gap-2">
                {customerScope.customer_scope_photo_urls.map((url, idx) => (
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

        {/* Contractor's Response */}
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 font-bold">✓</span>
            </div>
            <h3 className="font-semibold text-slate-900">Your Proposal</h3>
            <Badge className="bg-amber-100 text-amber-700 text-xs">Your solution</Badge>
          </div>

          {contractorScope?.scope_summary && (
            <div className="mb-4">
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{contractorScope.scope_summary}</p>
            </div>
          )}

          {contractorScope && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Cost Type:</span>
                <span className="font-medium text-slate-900 capitalize">{contractorScope.cost_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Amount:</span>
                <span className="font-medium text-slate-900">${contractorScope.cost_amount?.toFixed(2)}</span>
              </div>
              {contractorScope.estimated_hours && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Est. Hours:</span>
                  <span className="font-medium text-slate-900">{contractorScope.estimated_hours}h</span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}