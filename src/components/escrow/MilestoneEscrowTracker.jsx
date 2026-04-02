import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function MilestoneEscrowTracker({ scopeId }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [releasingId, setReleasingId] = useState(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const result = await base44.entities.EscrowMilestone.filter({
          scope_id: scopeId,
        });
        setMilestones(result || []);
      } catch (error) {
        console.error('Failed to fetch milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    if (scopeId) fetchMilestones();
  }, [scopeId]);

  const handleRelease = async (milestone) => {
    setReleasingId(milestone.id);
    try {
      await base44.functions.invoke('releaseEscrowMilestone', {
        milestoneId: milestone.id,
        scopeId,
      });
      // Refresh
      const result = await base44.entities.EscrowMilestone.filter({ scope_id: scopeId });
      setMilestones(result || []);
    } catch (error) {
      console.error('Failed to release escrow:', error);
    } finally {
      setReleasingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
        <Lock className="w-5 h-5 text-blue-600" />
        Milestone Escrow
      </h3>

      {milestones.length === 0 ? (
        <p className="text-gray-600">No milestones set up for this project</p>
      ) : (
        milestones.map((milestone) => (
          <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{milestone.milestone_name}</h4>
                <p className="text-sm text-gray-600">{milestone.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">${milestone.amount}</p>
                <p className="text-xs text-gray-500">{milestone.percentage_of_total}% of total</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {milestone.status === 'paid' && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Released</span>
                </div>
              )}
              {milestone.status === 'pending' && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Pending</span>
                </div>
              )}
              {milestone.status === 'disputed' && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Disputed</span>
                </div>
              )}
            </div>

            {milestone.status === 'submitted' && (
              <button
                onClick={() => handleRelease(milestone)}
                disabled={releasingId === milestone.id}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {releasingId === milestone.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Releasing...
                  </>
                ) : (
                  'Approve & Release Funds'
                )}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}