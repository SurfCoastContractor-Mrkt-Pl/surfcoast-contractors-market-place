import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TierEligibilityStatus({ contractor_email, completed_jobs = 0, has_verified_license = false }) {
  const [tierData, setTierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkTierEligibility();
  }, [contractor_email, completed_jobs]);

  const checkTierEligibility = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('validateWaveOSTierEligibility', {
        contractor_email,
        completed_jobs,
        has_verified_license
      });
      setTierData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-xs text-gray-500">Checking tier eligibility...</div>;
  if (error) return <div className="flex gap-2 text-red-600 text-xs"><AlertCircle className="w-3 h-3" />{error}</div>;

  return tierData ? (
    <div className="border rounded p-3 space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-blue-600" />
        <span className="font-medium">Current Tier: <span className="uppercase">{tierData.current_tier}</span></span>
      </div>
      <div className="text-xs text-gray-600">Jobs completed: {tierData.completed_jobs}</div>
      {tierData.next_tier_requirement && (
        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
          <span className="font-medium">Next: {tierData.next_tier_requirement.tier}</span>
          <div>Need {tierData.next_tier_requirement.required_jobs} jobs</div>
          {tierData.next_tier_requirement.requires_license && <div>License verification required</div>}
        </div>
      )}
    </div>
  ) : null;
}