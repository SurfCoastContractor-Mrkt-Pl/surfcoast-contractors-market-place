import React from 'react';
import { Globe, ShieldOff } from 'lucide-react';

export default function RegionBlocked() {
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
        <p className="text-slate-400 text-sm leading-relaxed">
          SurfCoast Contractor Market Place is currently only available within the United States. 
          We apologize for any inconvenience.
        </p>
        <div className="mt-8 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-500">
          If you believe this is an error and you are located in the United States, please try again or contact support.
        </div>
      </div>
    </div>
  );
}