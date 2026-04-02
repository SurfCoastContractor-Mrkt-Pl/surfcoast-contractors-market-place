import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Star, MapPin, Loader2 } from 'lucide-react';

export default function JobMatchingDashboard({ jobId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const result = await base44.functions.invoke('matchJobsToContractors', {
          jobId,
          limit: 10,
        });
        setMatches(result.matches || []);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchMatches();
  }, [jobId]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-900">Recommended Contractors</h3>

      {matches.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No matching contractors found</p>
      ) : (
        matches.map((match, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{match.contractor_name}</h4>
                <p className="text-sm text-gray-600">{match.location}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-blue-600">{match.match_score}%</span>
                </div>
                <p className="text-xs text-gray-500">{match.recommendation_reason}</p>
              </div>
            </div>

            {match.rating && (
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < match.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-gray-600">{match.rating}</span>
              </div>
            )}

            <div className="flex gap-2 text-sm">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Send Inquiry
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}