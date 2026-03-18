import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MapPin, Star, ShoppingBag, AlertTriangle, ChevronLeft, CalendarDays, CreditCard, Loader2 } from 'lucide-react';

const SHOP_TYPE_LABELS = {
  farmers_market: 'Farmers Market',
  swap_meet: 'Swap Meet',
  both: 'Farmers Market & Swap Meet',
};

const SHOP_TYPE_COLORS = {
  farmers_market: 'bg-green-100 text-green-700',
  swap_meet: 'bg-purple-100 text-purple-700',
  both: 'bg-blue-100 text-blue-700',
};

export default function MarketShopProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.MarketShop.filter({ id })
      .then(data => setShop(data?.[0] || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🛍️</div>
          <p className="font-medium text-slate-600">Vendor not found.</p>
          <button onClick={() => navigate('/MarketDirectory')} className="mt-4 text-sm text-blue-600 hover:underline">
            Back to directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Platform Disclaimer:</span> SurfCoast Marketplace does not employ, endorse, or guarantee any vendor. Use at your own risk. You are solely responsible for vetting this vendor.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate('/MarketDirectory')}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Directory
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl flex-shrink-0">
              🛍️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-800">{shop.shop_name}</h1>
                {shop.shop_type && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SHOP_TYPE_COLORS[shop.shop_type] || 'bg-slate-100 text-slate-600'}`}>
                    {SHOP_TYPE_LABELS[shop.shop_type] || shop.shop_type}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="w-4 h-4" />
                {[shop.city, shop.state, shop.zip].filter(Boolean).join(', ')}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm text-slate-500">No reviews yet</span>
              </div>
            </div>
          </div>

          {shop.description && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">About this Shop</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{shop.description}</p>
            </div>
          )}

          {shop.products_summary && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Products & Services</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{shop.products_summary}</p>
            </div>
          )}

          {(shop.categories || []).length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {shop.categories.map(cat => (
                  <span key={cat} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{cat}</span>
                ))}
              </div>
            </div>
          )}

          {(shop.payment_methods || []).length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> Payment Methods
              </h3>
              <div className="flex flex-wrap gap-2">
                {shop.payment_methods.map(m => (
                  <span key={m} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Markets */}
        {(shop.markets || []).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Where to Find Us</h2>
            <div className="space-y-3">
              {shop.markets.map((m, i) => (
                <div key={m.id || i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-slate-800">{m.location}</p>
                    {m.dates && (
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> {m.dates}
                      </p>
                    )}
                    {m.booth_number && (
                      <p className="text-xs text-slate-500 mt-0.5">Booth: {m.booth_number}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Reviews</h2>
          <div className="text-center py-8">
            <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No reviews yet for this vendor.</p>
          </div>
        </div>
      </div>
    </div>
  );
}