import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const COMPLIANCE_URL = 'https://sage-c5f01224.base44.app/functions/submitComplianceAck';
const GET_COMPLIANCE_URL = 'https://sage-c5f01224.base44.app/functions/getLocationCompliance';

const CHECKBOXES = [
  {
    id: 'federal',
    label: 'I understand my federal compliance obligations',
    subtext: 'FLSA, OSHA, EEOC, and IRS 1099 contractor rules apply to my work.',
  },
  {
    id: 'state',
    label: 'I understand my state licensing and registration requirements',
    subtext: 'I am responsible for all required licenses, permits, insurance, and registrations in [STATE].',
  },
  {
    id: 'platform',
    label: "I agree to SurfCoast's platform terms",
    subtext: '3% fee on completed, paid jobs. No monthly fees. I am an independent contractor, not a SurfCoast employee.',
  },
  {
    id: 'pricing',
    label: 'I understand I set my own rates',
    subtext: 'SurfCoast does not set, cap, or suggest my pricing. I am solely responsible for what I charge.',
  },
];

export default function ComplianceAcknowledgment({ contractorId, contractorLocation, onComplete }) {
  const [checks, setChecks] = useState({
    federal: false,
    state: false,
    platform: false,
    pricing: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [detectedState, setDetectedState] = useState(null);

  // Fetch location compliance info on mount
  useEffect(() => {
    const fetchCompliance = async () => {
      setLoading(true);
      try {
        const res = await fetch(GET_COMPLIANCE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data.detected_state) {
          setDetectedState(data.detected_state);
        }
      } catch (err) {
        console.error('Failed to fetch location compliance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompliance();
  }, []);

  const allChecked = Object.values(checks).every(v => v === true);

  const handleToggle = (id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(COMPLIANCE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: contractorId,
          federal_acknowledged: true,
          state_acknowledged: true,
          platform_terms_acknowledged: true,
          pricing_autonomy_acknowledged: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit compliance acknowledgment');
      }
      onComplete();
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Compliance submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const stateDisplay = detectedState || contractorLocation?.split(',')[1]?.trim() || 'your state';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Know the Rules. Own Your Business.</h1>
            <p className="text-slate-600">Before activating your profile, confirm your understanding of platform compliance.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Checkboxes */}
          <div className="space-y-3 mb-8">
            {CHECKBOXES.map(checkbox => {
              const isChecked = checks[checkbox.id];
              const subtext = checkbox.subtext.replace('[STATE]', stateDisplay);
              
              return (
                <button
                  key={checkbox.id}
                  onClick={() => handleToggle(checkbox.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isChecked
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center mt-0.5 ${
                      isChecked
                        ? 'border-green-500 bg-green-500'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isChecked ? 'text-green-900' : 'text-slate-900'}`}>
                        {checkbox.label}
                      </p>
                      <p className={`text-xs mt-1 ${isChecked ? 'text-green-700' : 'text-slate-600'}`}>
                        {subtext}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!allChecked || submitting}
            className="w-full text-white font-semibold h-10 text-sm disabled:opacity-50"
            style={allChecked && !submitting ? { backgroundColor: '#1E5A96' } : {}}
            variant={allChecked && !submitting ? 'default' : 'outline'}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              'I Confirm — Activate My Profile →'
            )}
          </Button>

          {/* Legal Note */}
          <p className="text-xs text-slate-500 text-center mt-6 pt-6 border-t border-slate-200">
            Recorded with timestamp and location. Legal record.
          </p>
        </Card>
      </div>
    </div>
  );
}