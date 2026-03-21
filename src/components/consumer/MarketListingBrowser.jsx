import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConsumerMode } from '@/lib/ConsumerModeContext';

export default function MarketListingBrowser({ listing, shopName, shopId }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useConsumerMode();

  const handleAddToCart = () => {
    addToCart({
      id: listing.id,
      shop_id: shopId,
      shop_name: shopName,
      product_name: listing.product_name,
      category: listing.category,
      price: listing.price,
      unit: listing.unit,
      image_url: listing.image_url,
      quantity,
    });
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {listing.image_url && (
        <div className="relative h-40 overflow-hidden bg-slate-100">
          <img
            src={listing.image_url}
            alt={listing.product_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-slate-900">{listing.product_name}</h3>
          <p className="text-xs text-slate-500 mt-1">{shopName}</p>
        </div>

        {listing.description && (
          <p className="text-sm text-slate-600 line-clamp-2">{listing.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900">${listing.price.toFixed(2)}</p>
            <p className="text-xs text-slate-500">{listing.unit}</p>
          </div>
          <Badge variant="outline">{listing.category}</Badge>
        </div>

        {listing.quantity_available && (
          <p className="text-xs text-slate-500">
            In Stock: {listing.quantity_available}
          </p>
        )}

        {/* Quantity Selector & Add to Cart */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 hover:bg-slate-200 rounded"
            >
              <Minus className="w-4 h-4 text-slate-600" />
            </button>
            <span className="w-8 text-center font-medium text-slate-900">{quantity}</span>
            <button
              onClick={() =>
                setQuantity(
                  listing.quantity_available
                    ? Math.min(listing.quantity_available, quantity + 1)
                    : quantity + 1
                )
              }
              className="p-1 hover:bg-slate-200 rounded"
            >
              <Plus className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <Button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}