import React from 'react';
import { Star } from 'lucide-react';

export default function MarketShopReviews() {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-800 mb-4">Reviews</h3>
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center py-14 text-center">
        <Star className="w-10 h-10 text-slate-300 mb-3" />
        <p className="font-medium text-slate-500">No reviews yet</p>
        <p className="text-sm text-slate-400 mt-1">Customer reviews will appear here once you receive them.</p>
      </div>
    </div>
  );
}