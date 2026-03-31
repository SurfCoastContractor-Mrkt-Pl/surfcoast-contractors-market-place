import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SaveSearchButton({ searchFilters, searchName }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveSearch = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        alert('Please log in to save searches');
        setLoading(false);
        return;
      }

      // Create or update saved search in local storage for now
      // Later can be persisted to SavedSearch entity
      const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
      const newSearch = {
        id: Date.now(),
        name: searchName || `Search ${new Date().toLocaleDateString()}`,
        filters: searchFilters,
        createdAt: new Date().toISOString()
      };

      savedSearches.push(newSearch);
      localStorage.setItem('savedSearches', JSON.stringify(savedSearches));

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving search:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSaveSearch}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        saved
          ? 'bg-red-100 text-red-700'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
      title="Save this search for quick access later"
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
      {saved ? 'Saved' : 'Save Search'}
    </button>
  );
}