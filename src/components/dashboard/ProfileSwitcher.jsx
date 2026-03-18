import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function ProfileSwitcher({ activeProfile, primaryType, hasMarketShop }) {
  const navigate = useNavigate();

  const primary = primaryType === 'contractor'
    ? { key: 'contractor', label: 'Contractor', description: 'Trades & services', emoji: '🔧', route: '/Dashboard' }
    : { key: 'customer', label: 'Customer', description: 'Browse & hire', emoji: '🏠', route: '/Dashboard' };

  const marketShop = { key: 'marketshop', label: 'MarketShop', description: 'Market & vendor', emoji: '🛍️', route: '/MarketShopDashboard', addRoute: '/MarketShopSignup' };

  const cards = [primary, marketShop];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">My Profiles</p>
        <div className="flex gap-3">
          {cards.map(({ key, label, description, emoji, route, addRoute }) => {
            const isActive = activeProfile === key;
            const exists = key === 'marketshop' ? hasMarketShop : true;

            if (exists) {
              return (
                <button
                  key={key}
                  onClick={() => navigate(route)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left flex-1 sm:flex-none ${
                    isActive
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <div className={`font-semibold text-sm ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{label}</div>
                    <div className="text-xs text-slate-500">{description}</div>
                  </div>
                  {isActive && (
                    <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Active</span>
                  )}
                </button>
              );
            }

            return (
              <button
                key={key}
                onClick={() => navigate(addRoute)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-150 text-left flex-1 sm:flex-none"
              >
                <span className="text-2xl opacity-40">{emoji}</span>
                <div>
                  <div className="font-semibold text-sm text-slate-400">Add MarketShop</div>
                  <div className="text-xs text-slate-400">Market & vendor</div>
                </div>
                <span className="ml-2 flex items-center gap-1 text-xs font-medium text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
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