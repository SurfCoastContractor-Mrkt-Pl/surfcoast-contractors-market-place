import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, AlertCircle, Briefcase, ChevronRight } from 'lucide-react';
import PaymentGate from '@/components/payment/PaymentGate';

export default function QuoteRequestForm({ contractor, customer, open, onClose }) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  // Fetch customer's job postings
  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ['customer-jobs-for-quote', customer?.email],
    queryFn: () => base44.entities.Job.filter({ poster_email: customer?.email }),
    enabled: !!customer?.email && open,
  });

  const handleJobSelect = (job) => {
    if (selectedJobId === job.id) {
      // Deselect
      setSelectedJobId('');
      setSelectedJobTitle('');
      setWorkDescription('');
    } else {
      setSelectedJobId(job.id);
      setSelectedJobTitle(job.title);
      setWorkDescription(job.description || '');
    }
  };

  const handleNoJobSelect = () => {
    setSelectedJobId('none');
    setSelectedJobTitle('');
  };

  const jobSelected = jobs.length === 0 || selectedJobId === 'none' || (selectedJobId && selectedJobId !== '');
  const canProceed = 
    jobSelected && 
    workDescription.trim() && 
    contractor?.id && 
    contractor?.email && 
    customer?.email && 
    customer?.full_name;

  const quoteMetaParam = canProceed
    ? `&quote_meta=${encodeURIComponent(JSON.stringify({
        contractor_id: contractor.id,
        contractor_name: contractor.name,
        contractor_email: contractor.email,
        customer_email: customer?.email || '',
        customer_name: customer?.full_name || '',
        work_description: workDescription,
        job_id: selectedJobId !== 'none' ? selectedJobId : '',
        job_title: selectedJobTitle,
      }))}`
    : '';

  const handleClose = () => {
    setSelectedJobId('');
    setSelectedJobTitle('');
    setWorkDescription('');
    setShowPayment(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Quote from {contractor.name}</DialogTitle>
          <DialogDescription>Select the project and describe the work, then pay the $1.75 fee.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">

          {/* Step 1: Select Job */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Which project is this for? *
            </label>

            {jobs.length > 0 ? (
              <div className="space-y-2">
                {jobs.map(job => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleJobSelect(job)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedJobId === job.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                          {job.location && <p className="text-xs text-slate-500">{job.location}</p>}
                        </div>
                      </div>
                      {selectedJobId === job.id && (
                        <span className="text-xs font-semibold text-blue-600 shrink-0">Selected</span>
                      )}
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleNoJobSelect}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedJobId === 'none'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-dashed border-slate-300 hover:border-slate-400 bg-white'
                  }`}
                >
                  <p className="text-sm text-slate-600">+ This is for a new/different project</p>
                </button>
              </div>
            ) : (
              // No jobs posted — go straight to description
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                You have no job postings yet. Describe the work below.
              </div>
            )}
          </div>

          {/* Step 2: Work Description — shown after job selection */}
          {(selectedJobId || jobs.length === 0) && (
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Describe the work needed *
              </label>
              <Textarea
                placeholder="Example: Need to repair a leaky kitchen faucet and replace the cartridge. Also need to fix a loose toilet seat in the bathroom."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="resize-none"
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-1">
                Be specific so the contractor can provide an accurate estimate.
              </p>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              A one-time $1.75 fee sends this request. The contractor will review and either approve (provide a quote) or decline. You'll see the status in your account.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              onClick={() => setShowPayment(true)}
              disabled={!canProceed}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Pay $1.75 &amp; Send Request
            </Button>
          </div>
        </div>

        <PaymentGate
          open={showPayment}
          onClose={() => setShowPayment(false)}
          onPaid={() => setShowPayment(false)}
          payerType="customer"
          contractorId={contractor.id}
          contractorEmail={contractor.email}
          contractorName={contractor.name}
          quoteMetaParam={quoteMetaParam}
        />
      </DialogContent>
    </Dialog>
  );
}