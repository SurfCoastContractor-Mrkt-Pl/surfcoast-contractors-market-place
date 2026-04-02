import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles } from 'lucide-react';

export default function AIProfileGenerator({ formData, onBioGenerated }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const handleGenerateBio = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('generateContractorProfile', {
        name: formData.name,
        lineOfWork: formData.line_of_work,
        yearsExperience: formData.years_experience,
        skills: formData.skills,
        location: formData.location,
        rateType: formData.rate_type,
        rate: formData.rate_type === 'hourly' ? formData.hourly_rate : formData.fixed_rate,
      });

      setGenerated(result);
      if (onBioGenerated) onBioGenerated(result.bio);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-gray-900">AI Profile Assistant</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Let AI help you craft a compelling professional bio based on your experience and expertise.
      </p>

      <button
        onClick={handleGenerateBio}
        disabled={loading || !formData.name || !formData.line_of_work}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Bio
          </>
        )}
      </button>

      {generated && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">Generated Bio:</p>
          <p className="text-sm text-gray-600 mb-3">{generated.bio}</p>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">Suggestions:</p>
            <p className="text-xs text-gray-600">📌 <strong>Headline:</strong> {generated.suggestions.headline}</p>
            <p className="text-xs text-gray-600">💬 <strong>Tagline:</strong> {generated.suggestions.tagline}</p>
          </div>
        </div>
      )}
    </div>
  );
}