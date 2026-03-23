import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, MapPin, Tag, ShoppingBag, X, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SHOP_TYPE_LABELS = {
  farmers_market: { label: "Farmer's Market", color: 'bg-green-100 text-green-700' },
  swap_meet: { label: 'Swap Meet', color: 'bg-amber-100 text-amber-700' },
  both: { label: 'Market & Swap', color: 'bg-blue-100 text-blue-700' },
};

const CATEGORY_LABELS = {
  vegetables: '🥦 Vegetables', fruits: '🍎 Fruits', herbs: '🌿 Herbs',
  dairy: '🧀 Dairy', meat: '🥩 Meat', baked: '🍞 Baked Goods',
  preserves: '🫙 Preserves', crafts: '🎨 Crafts', flowers: '🌸 Flowers',
  electronics: '📱 Electronics', tools: '🔧 Tools', clothing_accessories: '👗 Clothing',
  handmade_crafts: '✂️ Handmade', vintage_antiques: '🪞 Vintage', jewelry: '💍 Jewelry',
  collectibles: '🏺 Collectibles', home_decor: '🏠 Home Décor', other: '📦 Other',
};

export default function ShopMapPopup({ shop, listings = [], onClose }) {
  if (!shop) return null;

  const typeInfo = SHOP_TYPE_LABELS[shop.shop_type] || { label: shop.shop_type, color: 'bg-slate-100 text-slate-700' };
  const activeListings = listings.filter(l => l.status === 'active').slice(0, 4);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] sm:bottom-6 sm:left-6 sm:right-auto sm:w-80 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="relative">
        {shop.banner_url ? (
          <img src={shop.banner_url} alt={shop.shop_name} className="w-full h-28 object-cover" />
        ) : (
          <div className="w-full h-20 bg-gradient-to-br from-blue-600 to-indigo-700" />
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow text-slate-600 hover:text-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {shop.logo_url && (
          <img
            src={shop.logo_url}
            alt="logo"
            className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl border-2 border-white shadow-md object-cover bg-white"
          />
        )}
      </div>

      {/* Body */}
      <div className="pt-7 px-4 pb-4 space-y-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-tight">{shop.shop_name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            {shop.average_rating > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {shop.average_rating.toFixed(1)}
                {shop.total_ratings > 0 && <span className="text-slate-400 font-normal ml-0.5">({shop.total_ratings})</span>}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{[shop.city, shop.state].filter(Boolean).join(', ')}</span>
        </div>

        {shop.description && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{shop.description}</p>
        )}

        {/* Active listings preview */}
        {activeListings.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> Available Now
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {activeListings.map(listing => (
                <div key={listing.id} className="bg-slate-50 rounded-lg p-2 flex items-center gap-2">
                  {listing.image_url ? (
                    <img src={listing.image_url} alt={listing.product_name} className="w-7 h-7 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded bg-slate-200 flex items-center justify-center flex-shrink-0 text-xs">
                      {CATEGORY_LABELS[listing.category]?.split(' ')[0] || '📦'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{listing.product_name}</p>
                    <p className="text-xs text-slate-500">${listing.price} {listing.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {shop.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {shop.categories.slice(0, 4).map(cat => (
              <span key={cat} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {CATEGORY_LABELS[cat] || cat}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          to={`/vendor/${shop.id}`}
          className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          View Full Shop <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}