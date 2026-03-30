import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Edit2, Shield, Loader2, AlertCircle, CheckCircle, Filter } from 'lucide-react';

export default function LocationRatingAdmin() {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const queryClient = useQueryClient();

  // Fetch ratings
  const { data: ratings = [], isLoading } = useQuery({
    queryKey: ['locationRatings', filterType],
    queryFn: async () => {
      const query = filterType === 'all' ? {} : { location_type: filterType };
      return await base44.entities.SwapMeetLocationRating.filter(query, sortBy, 200);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SwapMeetLocationRating.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locationRatings'] }),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SwapMeetLocationRating.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locationRatings'] });
      setEditingId(null);
      setEditData(null);
    },
  });

  const handleDelete = useCallback((id) => {
    if (window.confirm('Delete this rating?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleSaveEdit = useCallback(() => {
    if (editingId && editData) {
      updateMutation.mutate({ id: editingId, data: editData });
    }
  }, [editingId, editData, updateMutation]);

  const getLocationTypeColor = (type) => {
    return type === 'swap_meet' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-900">Location Rating Admin</h1>
          </div>
          <p className="text-slate-600">Moderate and manage location ratings and reviews.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">All Locations</option>
                <option value="swap_meet">Swap Meets Only</option>
                <option value="farmers_market">Farmers Markets Only</option>
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="-created_date">Newest First</option>
              <option value="created_date">Oldest First</option>
            </select>
            <span className="text-sm text-slate-600 ml-auto">
              {ratings.length} total ratings
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : ratings.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No ratings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className={`border rounded-lg p-4 ${getLocationTypeColor(rating.location_type)}`}
              >
                {editingId === rating.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editData.location_name}
                        onChange={(e) => setEditData({ ...editData, location_name: e.target.value })}
                        placeholder="Location name"
                        className="px-3 py-2 border border-slate-200 rounded text-sm"
                      />
                      <input
                        type="text"
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        placeholder="City"
                        className="px-3 py-2 border border-slate-200 rounded text-sm"
                      />
                    </div>
                    <textarea
                      value={editData.comments}
                      onChange={(e) => setEditData({ ...editData, comments: e.target.value })}
                      placeholder="Comments"
                      className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={updateMutation.isPending}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditData(null); }}
                        className="px-3 py-1 border border-slate-200 text-slate-700 rounded text-sm hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{rating.location_name}</h3>
                        <p className="text-sm text-slate-600">{rating.city}, {rating.state?.toUpperCase()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rating.location_type === 'swap_meet'
                          ? 'bg-orange-200 text-orange-800'
                          : 'bg-green-200 text-green-800'
                      }`}>
                        {rating.location_type === 'swap_meet' ? 'Swap Meet' : 'Farmers Market'}
                      </span>
                    </div>

                    {/* Ratings Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 my-3 text-center text-xs">
                      {[
                        { key: 'cleanliness', label: 'Clean' },
                        { key: 'environment_comfort', label: 'Comfort' },
                        { key: 'customer_purchase_rate', label: 'Purchase' },
                        { key: 'safety_security', label: 'Safety' },
                        { key: 'foot_traffic', label: 'Traffic' },
                        { key: 'space_layout', label: 'Layout' },
                        { key: 'overall_experience', label: 'Overall' },
                      ].map(({ key, label }) => (
                        <div key={key} className="bg-white/50 rounded p-1">
                          <div className="font-bold text-slate-900">{rating[key]}</div>
                          <div className="text-slate-600">{label}</div>
                        </div>
                      ))}
                    </div>

                    {rating.comments && (
                      <p className="text-sm text-slate-700 mb-3 italic">"{rating.comments}"</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <div>
                        By {rating.rater_name} • {new Date(rating.created_date).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(rating.id);
                            setEditData(rating);
                          }}
                          className="p-1 hover:bg-white/50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rating.id)}
                          disabled={deleteMutation.isPending}
                          className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}