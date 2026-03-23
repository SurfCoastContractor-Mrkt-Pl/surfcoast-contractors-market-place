import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyStateIllustration from './EmptyStateIllustration';

export default function SavedVendors({ userEmail }) {
  const queryClient = useQueryClient();
  const [savedShops, setSavedShops] = useState([]);

  const { data: shops, isLoading } = useQuery({
    queryKey: ['savedVendors', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      try {
        const allShops = await base44.entities.MarketShop.list();
        return allShops?.filter(shop => savedShops.includes(shop.id)) || [];
      } catch (err) {
        console.error('Error fetching saved vendors:', err);
        return [];
      }
    },
    enabled: !!userEmail
  });

  const toggleSave = (shopId) => {
    setSavedShops(prev =>
      prev.includes(shopId)
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    );
    queryClient.invalidateQueries({ queryKey: ['savedVendors', userEmail] });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-4">
      {shops && shops.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {shops.map(shop => (
            <Card key={shop.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{shop.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-sm text-slate-600">
                    <MapPin className="w-3 h-3" />
                    {shop.location}
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(shop.id)}
                  className="text-red-500 hover:scale-110 transition-transform"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{shop.rating || 'N/A'}</span>
              </div>
              <Link to={`/vendor/${shop.id}`}>
                <Button variant="outline" className="w-full" size="sm">
                  View Shop
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Heart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No saved vendors yet. Save your favorites while browsing!</p>
        </Card>
      )}
    </div>
  );
}