import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const SUBMIT_URL = 'https://sage-c5f01224.base44.app/functions/submitRating';

const RATING_ROWS = [
  { key: 'overall_rating', label: 'Overall', required: true },
  { key: 'quality_rating', label: 'Quality of Work', required: false },
  { key: 'punctuality_rating', label: 'Punctuality', required: false },
  { key: 'communication_rating', label: 'Communication', required: false },
  { key: 'professionalism_rating', label: 'Professionalism', required: false },
];

function StarRow({ label, required, value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 font-bold">*</span>}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)}
              className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
              style={{ color: filled ? '#f59e0b' : '#6b7280' }}
            >
              ★
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PendingRatingModal({ scope, raterType, raterEmail, onDone }) {
  const otherPartyName = raterType === 'contractor' ? scope.customer_name : scope.contractor_name;

  const [ratings, setRatings] = useState({
    overall_rating: 0,
    quality_rating: 0,
    punctuality_rating: 0,
    communication_rating: 0,
    professionalism_rating: 0,
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const canSubmit = ratings.overall_rating >= 1;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const body = {
      scope_id: scope.id,
      rater_email: raterEmail,
      rater_type: raterType,
      overall_rating: ratings.overall_rating,
      quality_rating: ratings.quality_rating || null,
      punctuality_rating: ratings.punctuality_rating || null,
      communication_rating: ratings.communication_rating || null,
      professionalism_rating: ratings.professionalism_rating || null,
      comment: comment.trim() || undefined,
    };

    const res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.both_rated) {
        setSuccessMsg('✅ Job fully closed. Both parties have rated.');
      } else {
        setSuccessMsg('✅ Rating submitted. Waiting for the other party to rate.');
      }
      setTimeout(() => {
        onDone();
        window.location.reload();
      }, 2500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Failed to submit rating. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Warning banner */}
        <div className="bg-amber-500 text-white px-5 py-3 rounded-t-2xl text-sm font-semibold flex items-center gap-2">
          ⚠️ Your account is paused until you submit this rating
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">Rate {otherPartyName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{scope.job_title}</p>
          </div>

          {/* Star rows */}
          <div className="divide-y divide-slate-100">
            {RATING_ROWS.map(row => (
              <StarRow
                key={row.key}
                label={row.label}
                required={row.required}
                value={ratings[row.key]}
                onChange={(v) => setRatings(prev => ({ ...prev, [row.key]: v }))}
              />
            ))}
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Leave a comment (optional)..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />

          {/* Error */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Success */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm font-medium text-green-800">
              {successMsg}
            </div>
          )}

          {/* Submit */}
          {!successMsg && (
            <Button
              className="w-full h-11 text-sm font-semibold gap-2"
              style={{ backgroundColor: '#f59e0b', color: '#fff' }}
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Rating →'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}