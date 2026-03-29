import React from 'react';
import { Bell } from 'lucide-react';

const BASE_NAV_TABS = [
  { id: 'jobs', label: 'Jobs' },
  { id: 'map', label: 'Map' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'reports', label: 'Reports' },
  { id: 'profile', label: 'Profile' },
];

const BREAKER_TAB = { id: 'breaker', label: 'SurfCoast Wave' };

export default function FieldOpsMobileNav({
  contractor,
  activeTab,
  onTabChange,
  hasBreakerAccess,
  isOnline,
  notifCount,
}) {
  const NAV_TABS = hasBreakerAccess ? [...BASE_NAV_TABS, BREAKER_TAB] : BASE_NAV_TABS;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-slate-400">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">SURFCOAST WAVES FO</span>
          <span className="text-xs text-blue-400 font-semibold ml-1">PRO</span>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-800">
           <Bell className="w-5 h-5 text-slate-400" />
           {notifCount > 0 && (
             <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
               {notifCount}
             </span>
           )}
         </button>
      </div>

      {/* Mobile Contractor Info */}
      <div className="lg:hidden bg-slate-900 px-4 py-3 flex-shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
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
          <div
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden bg-slate-900 border-t border-slate-800 flex-shrink-0 pb-safe-bottom">
        <div className="flex">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                activeTab === tab.id
                  ? tab.id === 'breaker'
                    ? 'text-blue-300'
                    : 'text-blue-400'
                  : 'text-slate-500'
              }`}
            >
              <span className="text-[10px] font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className={`w-1 h-1 rounded-full ${tab.id === 'breaker' ? 'bg-blue-300' : 'bg-blue-400'}`} />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}