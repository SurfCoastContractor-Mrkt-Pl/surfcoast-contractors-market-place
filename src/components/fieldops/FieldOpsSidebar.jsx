import React from 'react';
import { Briefcase, Map, Calendar, DollarSign, BarChart2, ShoppingBag, User, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE_NAV_TABS = [
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'invoices', label: 'Invoices', icon: DollarSign },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'supplies', label: 'Supply Houses', icon: ShoppingBag },
  { id: 'profile', label: 'Profile', icon: User },
];

const BREAKER_TAB = { id: 'breaker', label: 'SurfCoast Wave', icon: Zap };

export default function FieldOpsSidebar({
  contractor,
  activeTab,
  onTabChange,
  hasBreakerAccess,
  isOnline,
}) {
  const NAV_TABS = hasBreakerAccess ? [...BASE_NAV_TABS, BREAKER_TAB] : BASE_NAV_TABS;

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200">
        <h2 className="text-slate-800 font-bold text-sm">SURFCOAST WAVES FO</h2>
        <p className="text-blue-600 text-xs font-semibold mt-0.5">PRO</p>
      </div>

      {/* Contractor Info */}
      <div className="px-4 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {contractor?.photo_url ? (
              <img src={contractor.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{contractor?.name?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 font-semibold text-sm truncate">{contractor?.name}</p>
            <p className="text-slate-500 text-xs truncate capitalize">
              {contractor?.line_of_work?.replace(/_/g, ' ') || contractor?.trade_specialty || 'Contractor'}
            </p>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-semibold w-full text-center ${
            contractor?.availability_status === 'available'
              ? 'bg-green-100 text-green-700'
              : contractor?.availability_status === 'booked'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          {contractor?.availability_status || 'Available'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {NAV_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? tab.id === 'breaker'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-blue-100 text-blue-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <Link
          to="/ContractorAccount"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Portal
        </Link>
      </div>
    </div>
  );
}