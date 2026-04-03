import React from 'react';
import { Bell, Briefcase, Map, Calendar, DollarSign, BarChart2, ShoppingBag, User, Zap } from 'lucide-react';

const BASE_NAV_TABS = [
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'invoices', label: 'Invoices', icon: DollarSign },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'supplies', label: 'Supplies', icon: ShoppingBag },
  { id: 'profile', label: 'Profile', icon: User },
];

const BREAKER_TAB = { id: 'breaker', label: 'Wave', icon: Zap };

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
      <div className="lg:hidden bg-white px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-400'}`} />
          <span className="text-xs text-slate-500">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">SURFCOAST WAVES FO</span>
          <span className="text-xs text-blue-600 font-semibold ml-1">PRO</span>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-100">
           <Bell className="w-5 h-5 text-slate-500" />
           {notifCount > 0 && (
             <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
               {notifCount}
             </span>
           )}
         </button>
      </div>

      {/* Mobile Contractor Info */}
      <div className="lg:hidden bg-white px-4 py-3 flex-shrink-0 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
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
          <div
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden bg-white border-t border-slate-200 flex-shrink-0 pb-safe-bottom">
        <div className="flex overflow-x-auto scrollbar-none">
          {NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isBreaker = tab.id === 'breaker';
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-shrink-0 flex flex-col items-center justify-center px-3 py-2.5 gap-1 min-w-[56px] transition-colors ${
                  isActive
                    ? isBreaker ? 'text-blue-700' : 'text-blue-600'
                    : 'text-slate-400'
                }`}
                style={{ minHeight: '56px' }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                {isActive && (
                  <div className={`w-1 h-1 rounded-full ${isBreaker ? 'bg-blue-700' : 'bg-blue-600'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}