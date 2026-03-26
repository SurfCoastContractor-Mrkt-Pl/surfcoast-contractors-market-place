import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Star, Briefcase, MapPin, Clock, CheckCircle,
  ChevronRight, LogOut, Settings, Shield, Bell,
  Phone, Mail, Edit3, Camera, Award
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available', color: 'bg-green-500' },
  { value: 'booked', label: 'Booked', color: 'bg-yellow-500' },
  { value: 'on_vacation', label: 'On Vacation', color: 'bg-slate-500' },
];

export default function FieldProfile({ contractor, user, onUpdate }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const handleStatusChange = async (status) => {
    setUpdatingStatus(true);
    try {
      const updated = await base44.entities.Contractor.update(contractor.id, { availability_status: status });
      onUpdate(updated);
    } catch {}
    setUpdatingStatus(false);
    setShowStatusPicker(false);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === contractor.availability_status) || STATUS_OPTIONS[0];

  const stats = [
    { label: 'Jobs Done', value: contractor.completed_jobs_count || 0 },
    { label: 'Rating', value: contractor.rating ? `${contractor.rating.toFixed(1)}★` : '—' },
    { label: 'Reviews', value: contractor.reviews_count || 0 },
    { label: 'Clients', value: contractor.unique_customers_count || 0 },
  ];

  return (
    <div className="bg-slate-950 min-h-full pb-6">
      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-slate-800 overflow-hidden flex items-center justify-center">
              {contractor.photo_url
                ? <img src={contractor.photo_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-white">{contractor.name?.charAt(0)}</span>
              }
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-950 ${currentStatus.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-xl font-bold">{contractor.name}</h2>
            <p className="text-slate-400 text-sm capitalize mt-0.5">
              {contractor.line_of_work?.replace(/_/g, ' ') || contractor.trade_specialty || 'Contractor'}
            </p>
            {contractor.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 text-xs">{contractor.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Toggle */}
        <div className="mt-4 relative">
          <button
            onClick={() => setShowStatusPicker(!showStatusPicker)}
            disabled={updatingStatus}
            className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${currentStatus.color}`} />
              <span className="text-white font-semibold text-sm">{currentStatus.label}</span>
            </div>
            <span className="text-slate-500 text-xs">Tap to change</span>
          </button>

          {showStatusPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden z-10 shadow-xl">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-700 active:bg-slate-700 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${opt.color}`} />
                  <span className="text-white font-medium">{opt.label}</span>
                  {contractor.availability_status === opt.value && (
                    <CheckCircle className="w-4 h-4 text-blue-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-900 rounded-2xl p-3 text-center">
            <p className="text-white font-bold text-lg">{stat.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Contact Info */}
      <div className="mx-4 mt-4 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Contact</p>
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-slate-300 text-sm truncate">{user.email}</span>
        </div>
        {contractor.phone && (
          <div className="px-4 py-3 flex items-center gap-3 border-t border-slate-800">
            <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-slate-300 text-sm">{contractor.phone}</span>
          </div>
        )}
      </div>

      {/* License / Verification */}
      {(contractor.is_licensed_sole_proprietor || contractor.identity_verified) && (
        <div className="mx-4 mt-4 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Credentials</p>
          </div>
          {contractor.identity_verified && (
            <div className="px-4 py-3 flex items-center gap-3">
              <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm">Identity Verified</span>
              <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
            </div>
          )}
          {contractor.is_licensed_sole_proprietor && (
            <div className="px-4 py-3 flex items-center gap-3 border-t border-slate-800">
              <Award className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-slate-300 text-sm">Licensed Sole Proprietor</p>
                {contractor.license_number && (
                  <p className="text-slate-500 text-xs">Lic. #{contractor.license_number}</p>
                )}
              </div>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                contractor.license_verified ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
              }`}>
                {contractor.license_verified ? 'Verified' : 'Pending'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="mx-4 mt-4 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <a
          href="/ContractorAccount"
          className="flex items-center justify-between px-4 py-4 border-b border-slate-800 active:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 font-medium">Full Account Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </a>
        <a
          href="/Dashboard"
          className="flex items-center justify-between px-4 py-4 border-b border-slate-800 active:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 font-medium">Main Dashboard</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </a>
        <button
          onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-800"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}