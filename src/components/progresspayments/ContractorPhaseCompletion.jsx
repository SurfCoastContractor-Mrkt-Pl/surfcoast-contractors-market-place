import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import PhotoUploadZone from '@/components/photos/PhotoUploadZone';

export default function ContractorPhaseCompletion({ payment, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);

  const mutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('approveProgressPayment', {
        paymentId: payment.id,
        completionNotes: notes,
        photoUrls: photos
      });
    },
    onSuccess: () => {
      setNotes('');
      setPhotos([]);
      onSuccess?.();
    }
  });

  if (payment.status !== 'pending') {
    return (
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-semibold text-slate-900">Phase {payment.phase_number} Status</div>
            <div className="text-sm text-slate-600 capitalize">
              {payment.status === 'contractor_completed' && 'Awaiting customer approval'}
              {payment.status === 'customer_approved' && 'Approved - Payment released'}
              {payment.status === 'paid' && 'Paid'}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4 border-amber-200 bg-amber-50">
      <div>
        <h3 className="font-semibold text-slate-900 mb-1">Mark Phase {payment.phase_number} Complete</h3>
        <p className="text-sm text-slate-600">{payment.phase_title} - ${payment.amount}</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700 mb-1 block">Completion Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what was completed, any challenges, next steps..."
          rows={4}
          className="text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Before & After Photos</label>
        <PhotoUploadZone photos={photos} onChange={setPhotos} />
        <p className="text-xs text-slate-500 mt-2">Upload photos showing the completed work to help customer verify completion.</p>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !notes.trim()}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Submit Phase Complete
          </>
        )}
      </Button>

      {mutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {mutation.error?.message || 'Failed to submit completion'}
        </div>
      )}
    </Card>
  );
}