import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, X } from 'lucide-react';

export default function QuoteDetailModal({ open, onOpenChange, quote, onSendProposal, onSendMessage }) {
  if (!quote) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{quote.job_title}</DialogTitle>
              <DialogDescription>{quote.trade_category || 'General Work'}</DialogDescription>
            </div>
            <Badge className={getStatusColor(quote.status)}>
              {quote.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Client Information</h3>
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div>
                <p className="text-xs text-slate-600">Name</p>
                <p className="font-medium text-slate-900">{quote.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Email</p>
                <p className="font-medium text-slate-900">{quote.customer_email}</p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Work Description</h3>
            <p className="text-slate-700 leading-relaxed">{quote.work_description}</p>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4">
            {quote.budget && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Client Budget</p>
                <p className="font-semibold text-slate-900">{quote.budget}</p>
              </div>
            )}
            {quote.timeline && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Timeline</p>
                <p className="font-semibold text-slate-900">{quote.timeline}</p>
              </div>
            )}
            {quote.response_deadline && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Response Deadline</p>
                <p className="font-semibold text-slate-900">
                  {new Date(quote.response_deadline).toLocaleDateString()}
                </p>
              </div>
            )}
            {quote.contractor_estimate && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Your Proposal</p>
                <p className="font-semibold text-slate-900">${quote.contractor_estimate.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          {quote.photos && quote.photos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Client Photos</h3>
              <div className="grid grid-cols-3 gap-3">
                {quote.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Project photo ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {quote.contractor_message && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Your Notes</h3>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{quote.contractor_message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                onOpenChange(false);
                onSendProposal();
              }}
              className="gap-2 flex-1"
              disabled={quote.status === 'completed' || quote.status === 'rejected'}
            >
              <FileText className="w-4 h-4" />
              Send Proposal
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onSendMessage();
              }}
              className="gap-2 flex-1"
            >
              <MessageSquare className="w-4 h-4" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}