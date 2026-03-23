import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart } from 'lucide-react';
import EmptyStateIllustration from './EmptyStateIllustration';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);

  const removeItem = (itemId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <div className="space-y-4">
      {wishlistItems && wishlistItems.length > 0 ? (
        <div className="space-y-3">
          {wishlistItems.map(item => (
            <Card key={item.id} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{item.name}</h4>
                <p className="text-sm text-slate-600">{item.shop}</p>
                <p className="text-lg font-bold text-slate-900 mt-2">${item.price}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="default">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add to Cart
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">Your wishlist is empty. Add items to save them for later!</p>
        </Card>
      )}
    </div>
  );
}