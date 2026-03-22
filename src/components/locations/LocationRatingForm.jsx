import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Save, X, Loader2 } from 'lucide-react';

const RATING_QUESTIONS = [
  { key: 'cleanliness', label: 'How clean was the location?' },
  { key: 'environment_comfort', label: 'How comfortable was the environment?' },
  { key: 'customer_purchase_rate', label: 'Customer purchase rate observed' },
  { key: 'safety_security', label: 'Safety and security of location' },
  { key: 'foot_traffic', label: 'Foot traffic and visibility' },
  { key: 'space_layout', label: 'Space availability and layout' },
  { key: 'overall_experience', label: 'Overall experience rating' },
];

export default function LocationRatingForm({ location, onClose, onSave, existingRating = null }) {
  const [ratings, setRatings] = useState({
    cleanliness: existingRating?.cleanliness || 0,
    environment_comfort: existingRating?.environment_comfort || 0,
    customer_purchase_rate: existingRating?.customer_purchase_rate || 0,
    safety_security: existingRating?.safety_security || 0,
    foot_traffic: existingRating?.foot_traffic || 0,
    space_layout: existingRating?.space_layout || 0,
    overall_experience: existingRating?.overall_experience || 0,
  });
  const [comments, setComments] = useState(existingRating?.comments || '');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    getUser();
  }, []);

  const handleRatingChange = (key, value) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to rate locations');
      return;
    }

    if (Object.values(ratings).some(r => r === 0)) {
      alert('Please rate all questions');
      return;
    }

    setLoading(true);
    try {
      const data = {
        location_name: location.location_name || `${location.city}, ${location.state}`,
        city: location.city,
        state: location.state,
        location_type: location.location_type || 'swap_meet',
        rater_email: user.email,
        rater_name: user.full_name,
        ...ratings,
        comments,
      };

      if (existingRating?.id) {
        await base44.entities.SwapMeetLocationRating.update(existingRating.id, data);
      } else {
        await base44.entities.SwapMeetLocationRating.create(data);
      }

      onSave?.();
      onClose?.();
    } catch (error) {
      console.error('Error saving rating:', error);
      alert('Failed to save rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Rate This Location</h3>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {RATING_QUESTIONS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-700 mb-3">{label}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(key, star)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: ratings[key] >= star ? '#f97316' : '#f3f4f6',
                    color: ratings[key] >= star ? 'white' : '#9ca3af',
                  }}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
              <span className="ml-3 text-sm font-medium text-slate-600">
                {ratings[key] > 0 ? `${ratings[key]}/5` : 'Not rated'}
              </span>
            </div>
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Additional Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share any additional feedback about this location..."
            className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || Object.values(ratings).some(r => r === 0)}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Rating
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}