import React from 'react';
import { Globe, ShieldOff, MapPin } from 'lucide-react';

export default function RegionBlocked() {
  const params = new URLSearchParams(window.location.search);
  const countryName = params.get('country') || 'your region';
  const countryCode = params.get('code') || '';

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6">
          <Globe className="w-10 h-10 text-slate-500" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <ShieldOff className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm font-medium uppercase tracking-wide">Service Unavailable</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Not Available in Your Region
        </h1>

        {/* Detected location */}
        <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300 text-sm">
            Location detected: <strong className="text-white">{countryName}{countryCode ? ` (${countryCode})` : ''}</strong>
          </span>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed">
          SurfCoast Contractor Market Place is currently only available within the <strong className="text-white">United States</strong>.
          We apologize for any inconvenience.
        </p>
        <div className="mt-6 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-500">
          If you believe this is an error and you are located in the United States, please try again or contact support.
        </div>
      </div>
    </div>
  );
}