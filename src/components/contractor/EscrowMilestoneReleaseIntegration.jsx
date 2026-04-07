import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EscrowMilestoneReleaseIntegration({ scope_id, milestone_id, onReleaseComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleReleaseEscrow = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await base44.functions.invoke('fixReleaseEscrowMilestone', {
        scope_id,
        milestone_id
      });

      if (response.data?.success) {
        setSuccess(`Released $${response.data.released_amount} from escrow`);
        onReleaseComplete?.(response.data);
      } else {
        setError('Failed to release escrow');
      }
    } catch (err) {
      setError(err.message || 'Error releasing escrow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleReleaseEscrow}
        disabled={loading}
        variant="outline"
        className="gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
        {loading ? 'Releasing...' : 'Release Escrow'}
      </Button>
      {error && <div className="flex gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
      {success && <div className="flex gap-2 text-green-600 text-sm"><CheckCircle2 className="w-4 h-4" />{success}</div>}
    </div>
  );
}