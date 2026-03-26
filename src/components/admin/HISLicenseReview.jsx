import React, { useState } from 'react';
import { CheckCircle, XCircle, ExternalLink, Waves, AlertCircle, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HISLicenseReview({ contractors, onContractorUpdate }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending'); // pending | verified | all
  const [verifying, setVerifying] = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Only show contractors who have submitted an HIS license URL
  const hisContractors = contractors.filter(c => !!c.his_license_url);

  const filtered = hisContractors.filter(c => {
    const matchSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.his_license_number?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'verified' && c.his_license_verified) ||
      (filter === 'pending' && !c.his_license_verified);
    return matchSearch && matchFilter;
  });

  const handleVerify = async (contractor) => {
    setVerifying(contractor.id);
    await base44.entities.Contractor.update(contractor.id, {
      his_license_verified: true,
      his_license_status: 'active',
    });
    onContractorUpdate(contractor.id, { his_license_verified: true, his_license_status: 'active' });
    setVerifying(null);
  };

  const handleRevoke = async (contractor) => {
    setRevoking(contractor.id);
    await base44.entities.Contractor.update(contractor.id, {
      his_license_verified: false,
      his_license_status: 'inactive',
    });
    onContractorUpdate(contractor.id, { his_license_verified: false, his_license_status: 'inactive' });
    setRevoking(null);
  };

  const pendingCount = hisContractors.filter(c => !c.his_license_verified).length;
  const verifiedCount = hisContractors.filter(c => c.his_license_verified).length;

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-slate-400 mt-1">Pending Review</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{verifiedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Verified</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{hisContractors.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Submitted</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or license #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
        >
          <option value="pending">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* License Cards */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No HIS license submissions match your filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(c => (
            <div
              key={c.id}
              className={`bg-slate-800 border rounded-xl p-5 transition-all ${
                c.his_license_verified ? 'border-green-700' : 'border-yellow-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* License Image Preview */}
                <div
                  className="w-full sm:w-40 h-28 rounded-lg overflow-hidden bg-slate-700 border border-slate-600 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity relative group"
                  onClick={() => setLightboxUrl(c.his_license_url)}
                >
                  <img
                    src={c.his_license_url}
                    alt="HIS License"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Contractor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-white font-bold text-base">{c.name}</p>
                      <p className="text-slate-400 text-xs">{c.email}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      c.his_license_verified
                        ? 'bg-green-900 text-green-300'
                        : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {c.his_license_verified ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {c.his_license_verified ? 'Verified' : 'Pending'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 text-xs">
                    {c.his_license_number && (
                      <div className="bg-slate-700 rounded-lg px-3 py-1.5">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider">License #</p>
                        <p className="text-slate-200 font-mono font-medium mt-0.5">{c.his_license_number}</p>
                      </div>
                    )}
                    {c.his_license_state && (
                      <div className="bg-slate-700 rounded-lg px-3 py-1.5">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider">State</p>
                        <p className="text-slate-200 font-medium mt-0.5">{c.his_license_state}</p>
                      </div>
                    )}
                    <div className="bg-slate-700 rounded-lg px-3 py-1.5">
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider">Customers</p>
                      <p className="text-slate-200 font-medium mt-0.5">{c.unique_customers_count || 0} unique</p>
                    </div>
                  </div>

                  {/* Wave unlock notice */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <Waves className="w-3 h-3 text-amber-400" />
                    {c.his_license_verified
                      ? <span className="text-amber-400 font-semibold">Residential Wave Rider unlocked ✓</span>
                      : <span>Verification will unlock <strong className="text-amber-400">Residential Wave Rider</strong> in Field Ops</span>
                    }
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={c.his_license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Full Image
                    </a>

                    {!c.his_license_verified ? (
                      <button
                        onClick={() => handleVerify(c)}
                        disabled={verifying === c.id}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {verifying === c.id ? 'Verifying...' : 'Verify & Unlock Wave'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRevoke(c)}
                        disabled={revoking === c.id}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-red-900 hover:bg-red-800 disabled:opacity-50 text-red-300 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {revoking === c.id ? 'Revoking...' : 'Revoke Verification'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white text-sm hover:text-slate-300"
            >
              ✕ Close
            </button>
            <img src={lightboxUrl} alt="HIS License" className="w-full rounded-xl shadow-2xl" />
            <a
              href={lightboxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-blue-400 text-sm hover:text-blue-300"
            >
              <ExternalLink className="w-4 h-4" /> Open original in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}