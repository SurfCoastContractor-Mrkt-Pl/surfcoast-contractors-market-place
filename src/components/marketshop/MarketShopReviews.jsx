import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import ReviewsSection from './ReviewsSection';

export default function MarketShopReviews() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const shops = await base44.entities.MarketShop.filter({ email: user.email });
          setShop(shops?.[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-800 mb-6">My Reviews</h3>
      <ReviewsSection shop={shop} />
    </div>
  );
}