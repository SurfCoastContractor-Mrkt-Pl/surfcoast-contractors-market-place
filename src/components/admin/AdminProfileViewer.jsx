import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, HardHat, Search, MapPin, Phone, Mail, Star, CheckCircle2, Briefcase, ShieldCheck, ChevronLeft, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';

function ContractorProfileView({ contractor }) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
          {contractor.photo_url ? (
            <img src={contractor.photo_url} alt={contractor.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl font-bold">
              {contractor.name?.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-slate-900">{contractor.name}</h3>
            {contractor.identity_verified && (
              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified
              </Badge>
            )}
            {contractor.account_locked && (
              <Badge className="bg-red-100 text-red-700">Account Locked</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{contractor.email}</span>
            {contractor.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{contractor.phone}</span>}
            {contractor.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{contractor.location}</span>}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-slate-100 text-slate-700 capitalize">{contractor.contractor_type?.replace('_', ' ')}</Badge>
            {contractor.trade_specialty && <Badge className="bg-amber-100 text-amber-700 capitalize">{contractor.trade_specialty}</Badge>}
            <Badge className={contractor.availability_status === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
              {contractor.availability_status || 'Available'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{contractor.completed_jobs_count || 0}</div>
          <div className="text-xs text-slate-500 mt-0.5">Completed Jobs</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{contractor.rating ? contractor.rating.toFixed(1) : '—'}</div>
          <div className="text-xs text-slate-500 mt-0.5">Rating ({contractor.reviews_count || 0} reviews)</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{contractor.years_experience || '—'}</div>
          <div className="text-xs text-slate-500 mt-0.5">Years Experience</div>
        </div>
      </div>

      {/* Bio */}
      {contractor.bio && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bio</div>
          <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-200">{contractor.bio}</p>
        </div>
      )}

      {/* Skills */}
      {contractor.skills && contractor.skills.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {contractor.skills.map((s, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {contractor.certifications && contractor.certifications.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Certifications</div>
          <div className="flex flex-wrap gap-1.5">
            {contractor.certifications.map((c, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {contractor.portfolio_images && contractor.portfolio_images.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Portfolio ({contractor.portfolio_images.length} photos)</div>
          <div className="grid grid-cols-4 gap-2">
            {contractor.portfolio_images.slice(0, 8).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-16 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ID docs */}
      <div className="flex flex-wrap gap-2">
        {contractor.id_document_url && (
          <a href={contractor.id_document_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="text-xs">View Gov ID</Button>
          </a>
        )}
        {contractor.face_photo_url && (
          <a href={contractor.face_photo_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="text-xs">View Face Photo</Button>
          </a>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-slate-400">Joined: {new Date(contractor.created_date).toLocaleDateString()} · ID: {contractor.id}</div>
        <a href={createPageUrl(`ContractorProfile?id=${contractor.id}`)} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="text-xs flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Preview Public Profile
          </Button>
        </a>
      </div>
    </div>
  );
}

function CustomerProfileView({ customer }) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-indigo-600">{customer.full_name?.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-slate-900">{customer.full_name}</h3>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{customer.email}</span>
            {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>}
            {customer.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{customer.location}</span>}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{customer.total_jobs_posted || 0}</div>
          <div className="text-xs text-slate-500 mt-0.5">Jobs Posted</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{customer.completed_jobs_count || 0}</div>
          <div className="text-xs text-slate-500 mt-0.5">Completed Jobs</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">${(customer.total_spent || 0).toFixed(0)}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total Spent</div>
        </div>
      </div>

      {/* Bio */}
      {customer.bio && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bio</div>
          <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-200">{customer.bio}</p>
        </div>
      )}

      {/* Preferences */}
      {customer.preferred_contractor_types && customer.preferred_contractor_types.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Preferred Contractor Types</div>
          <div className="flex flex-wrap gap-1.5">
            {customer.preferred_contractor_types.map((t, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full capitalize">{t.replace('_', ' ')}</span>
            ))}
          </div>
        </div>
      )}

      {customer.preferred_trades && customer.preferred_trades.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Preferred Trades</div>
          <div className="flex flex-wrap gap-1.5">
            {customer.preferred_trades.map((t, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full capitalize">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-slate-400">Joined: {new Date(customer.created_date).toLocaleDateString()} · ID: {customer.id}</div>
    </div>
  );
}

export default function AdminProfileViewer({ contractors = [], customers = [] }) {
  const [profileType, setProfileType] = useState('contractor');
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);

  const list = profileType === 'contractor' ? contractors : customers;

  const filtered = list.filter(p => {
    const name = profileType === 'contractor' ? p.name : p.full_name;
    const q = search.toLowerCase();
    return (
      (name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.location || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: List */}
      <Card className="p-5 flex flex-col gap-4 h-[700px] overflow-hidden">
        {/* Type toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setProfileType('contractor'); setSelectedProfile(null); setSearch(''); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              profileType === 'contractor' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
            }`}
          >
            <HardHat className="w-4 h-4" /> Contractors ({contractors.length})
          </button>
          <button
            onClick={() => { setProfileType('customer'); setSelectedProfile(null); setSearch(''); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              profileType === 'customer' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
            }`}
          >
            <Users className="w-4 h-4" /> Customers ({customers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={`Search ${profileType}s...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No results found.</div>
          ) : (
            filtered.map(p => {
              const name = profileType === 'contractor' ? p.name : p.full_name;
              const isSelected = selectedProfile?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProfile(p)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 ${isSelected ? 'ring-2 ring-white' : ''}`}
                    style={{ background: profileType === 'contractor' ? '#f1f5f9' : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' }}>
                    {profileType === 'contractor' && p.photo_url ? (
                      <img src={p.photo_url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-sm"
                        style={{ color: isSelected ? '#fff' : '#64748b' }}>
                        {name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{name}</div>
                    <div className={`text-xs truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{p.email}</div>
                  </div>
                  {profileType === 'contractor' && p.identity_verified && (
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-green-300' : 'text-green-500'}`} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </Card>

      {/* Right: Detail */}
      <Card className="p-5 h-[700px] overflow-y-auto">
        {!selectedProfile ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              {profileType === 'contractor' ? <HardHat className="w-8 h-8" /> : <Users className="w-8 h-8" />}
            </div>
            <p className="text-sm">Select a {profileType} from the list<br />to view their full profile</p>
          </div>
        ) : profileType === 'contractor' ? (
          <ContractorProfileView contractor={selectedProfile} />
        ) : (
          <CustomerProfileView customer={selectedProfile} />
        )}
      </Card>
    </div>
  );
}