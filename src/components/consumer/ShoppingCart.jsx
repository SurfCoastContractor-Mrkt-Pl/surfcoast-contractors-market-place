import React from 'react';
import { ShoppingCart as ShoppingCartIcon, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useConsumerMode } from '@/lib/ConsumerModeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ShoppingCart() {
  const {
    cartItems,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  } = useConsumerMode();

  // Group items by shop
  const itemsByShop = cartItems.reduce((acc, item) => {
    if (!acc[item.shop_id]) {
      acc[item.shop_id] = [];
    }
    acc[item.shop_id].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Cart Icon Button */}
      <button
        onClick={() => setCartOpen(!cartOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        title="Shopping cart"
      >
        <ShoppingCartIcon className="w-5 h-5 text-slate-700" />
        {cartCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
            {cartCount}
          </Badge>
        )}
      </button>

      {/* Cart Panel */}
      {cartOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setCartOpen(false)}
          />

          {/* Cart Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg rounded-l-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Shopping Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <ShoppingCartIcon className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-slate-500">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Add items from market shops to get started</p>
                </div>
              ) : (
                Object.entries(itemsByShop).map(([shopId, items]) => (
                  <div key={shopId}>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      {items[0]?.shop_name || `Shop ${shopId.substring(0, 8)}`}
                    </h3>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div
                          key={`${item.id}-${item.shop_id}`}
                          className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                        >
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              ${item.price.toFixed(2)} {item.unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.shop_id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-slate-200 rounded"
                            >
                              <Minus className="w-3 h-3 text-slate-600" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.shop_id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-slate-200 rounded"
                            >
                              <Plus className="w-3 h-3 text-slate-600" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id, item.shop_id)}
                              className="p-1 hover:bg-red-100 rounded ml-1"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">Total:</span>
                  <span className="text-lg font-bold text-slate-900">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}