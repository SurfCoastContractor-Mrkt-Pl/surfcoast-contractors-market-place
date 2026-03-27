import React from 'react';
import { LogOut } from 'lucide-react';

const BASE_NAV_TABS = [
  { id: 'jobs', label: 'Jobs', icon: null },
  { id: 'map', label: 'Map', icon: null },
  { id: 'schedule', label: 'Schedule', icon: null },
  { id: 'invoices', label: 'Invoices', icon: null },
  { id: 'reports', label: 'Reports', icon: null },
  { id: 'profile', label: 'Profile', icon: null },
];

const BREAKER_TAB = { id: 'breaker', label: 'SurfCoast Wave', icon: null };

export default function FieldOpsSidebar({
  contractor,
  activeTab,
  onTabChange,
  hasBreakerAccess,
  isOnline,
  onLogout,
}) {
  const NAV_TABS = hasBreakerAccess ? [...BASE_NAV_TABS, BREAKER_TAB] : BASE_NAV_TABS;

  return (
    <div className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-800">
        <h2 className="text-white font-bold text-sm">SURFCOAST WAVES FO</h2>
        <p className="text-blue-400 text-xs font-semibold mt-0.5">PRO</p>
      </div>

      {/* Contractor Info */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {contractor?.photo_url ? (
              <img src={contractor.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{contractor?.name?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{contractor?.name}</p>
            <p className="text-slate-400 text-xs truncate capitalize">
              {contractor?.line_of_work?.replace(/_/g, ' ') || contractor?.trade_specialty || 'Contractor'}
            </p>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-semibold w-full text-center ${
            contractor?.availability_status === 'available'
              ? 'bg-green-900 text-green-400'
              : contractor?.availability_status === 'booked'
              ? 'bg-yellow-900 text-yellow-400'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {contractor?.availability_status || 'Available'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? tab.id === 'breaker'
                  ? 'bg-blue-900 text-blue-300'
                  : 'bg-blue-900 text-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
}