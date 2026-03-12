import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, UserCheck } from 'lucide-react';

export default function MinorGuardianDisclaimer({ onAllAgreed }) {
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    setAgreed(e.target.checked);
    if (onAllAgreed) onAllAgreed(e.target.checked);
  };

  return (
    <div className="rounded-2xl border-4 border-red-500 bg-red-50 overflow-hidden shadow-lg">
      {/* Top Banner */}
      <div className="bg-red-600 px-5 py-4 flex items-center gap-3">
        <ShieldAlert className="w-7 h-7 text-white shrink-0" />
        <div>
          <p className="text-white font-black text-base uppercase tracking-wider">⚠ Important Legal Notice</p>
          <p className="text-red-100 text-xs mt-0.5">Parent / Guardian Disclaimer for Minor Contractors</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Summary */}
        <div className="bg-white border border-red-200 rounded-xl p-4 text-sm text-slate-700 space-y-1.5 leading-relaxed">
          <p>• You (parent/guardian) must be <strong>physically present at all times</strong> during any work, travel, or client interaction.</p>
          <p>• You must <strong>vet every job</strong> — verify the client, inspect the site, and ensure no hazardous work.</p>
          <p>• All major decisions must be made by <strong>you, not the minor</strong>.</p>
          <p>• SurfCoast bears <strong>no liability</strong> — you accept full legal responsibility for the minor.</p>
          <p>• Federal FLSA and all applicable state labor laws remain in effect.</p>
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-amber-600 underline hover:text-amber-700 mt-1">
            Read full Terms & Policies →
          </a>
        </div>

        {/* Single checkbox */}
        <div className="flex items-start gap-3 p-4 bg-white border-2 border-red-400 rounded-xl">
          <input
            type="checkbox"
            id="minor_agree"
            checked={agreed}
            onChange={handleChange}
            className="mt-0.5 w-4 h-4 accent-red-600 shrink-0"
          />
          <label htmlFor="minor_agree" className="text-sm text-slate-800 cursor-pointer leading-relaxed font-medium">
            I have read and agree to all terms above. I confirm I am the legal parent or guardian and accept full responsibility for the minor's participation on SurfCoast.
          </label>
        </div>

        {agreed && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-400 rounded-xl text-sm text-green-800 font-semibold">
            <UserCheck className="w-5 h-5 shrink-0 text-green-600" />
            Acknowledged. You may proceed.
          </div>
        )}
      </div>
    </div>
  );
}