import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Wrench, ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PROFILES = [
  {
    key: 'customer',
    label: 'Customer',
    description: 'Browse & hire',
    icon: Home,
    emoji: '🏠',
    route: '/CustomerDashboard',
    addRoute: '/CustomerSignup',
  },
  {
    key: 'contractor',
    label: 'Contractor',
    description: 'Trades & services',
    icon: Wrench,
    emoji: '🔧',
    route: '/ContractorDashboard',
    addRoute: '/BecomeContractor',
  },
  {
    key: 'marketshop',
    label: 'MarketShop',
    description: 'Market & vendor',
    icon: ShoppingBag,
    emoji: '🛍️',
    route: '/MarketShopDashboard',
    addRoute: '/MarketShopSignup',
  },
];

export default function ProfileSwitcher({ activeProfile, profiles }) {
  const navigate = useNavigate();

  // profiles = { customer: bool, contractor: bool, marketshop: bool }
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">My Profiles</p>
        <div className="flex flex-wrap gap-3">
          {PROFILES.map(({ key, label, description, emoji, route, addRoute }) => {
            const hasProfile = profiles[key];
            const isActive = activeProfile === key;

            if (hasProfile) {
              return (
                <button
                  key={key}
                  onClick={() => navigate(route)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left ${
                    isActive
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <div className={`font-semibold text-sm ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                      {label}
                    </div>
                    <div className="text-xs text-slate-500">{description}</div>
                  </div>
                  {isActive && (
                    <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              );
            }

            return (
              <button
                key={key}
                onClick={() => navigate(addRoute)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-150 text-left"
              >
                <span className="text-2xl opacity-40">{emoji}</span>
                <div>
                  <div className="font-semibold text-sm text-slate-400">{label}</div>
                  <div className="text-xs text-slate-400">{description}</div>
                </div>
                <span className="ml-2 flex items-center gap-1 text-xs font-medium text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  <Plus className="w-3 h-3" /> Add
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}