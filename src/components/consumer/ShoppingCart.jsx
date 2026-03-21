import React from 'react';
import { ShoppingCart as ShoppingCartIcon, X, Plus, Minus, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useConsumerMode } from '@/lib/ConsumerModeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { updateInventoryAfterSale, validateInventoryAvailability } from '@/lib/inventoryManager';

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

  const [checkoutState, setCheckoutState] = useState('idle'); // idle, validating, processing, success, error
  const [checkoutMessage, setCheckoutMessage] = useState('');

  // Group items by shop
  const itemsByShop = cartItems.reduce((acc, item) => {
    if (!acc[item.shop_id]) {
      acc[item.shop_id] = [];
    }
    acc[item.shop_id].push(item);
    return acc;
  }, {});

  const handleCheckout = async () => {
    try {
      setCheckoutState('validating');
      setCheckoutMessage('Verifying inventory...');

      // Validate inventory availability
      const validation = await validateInventoryAvailability(cartItems);

      if (!validation.valid) {
        setCheckoutState('error');
        const unavailable = validation.unavailableItems?.map(i => i.name).join(', ') || '';
        const insufficient = validation.insufficientItems?.map(i => `${i.name} (${i.available} available, ${i.requested} requested)`).join(', ') || '';
        setCheckoutMessage(
          `${unavailable ? `Out of stock: ${unavailable}. ` : ''}${insufficient ? `Insufficient stock: ${insufficient}` : ''}`
        );
        return;
      }

      setCheckoutState('processing');
      setCheckoutMessage('Processing payment and updating inventory...');

      // Update inventory
      const inventoryResult = await updateInventoryAfterSale(cartItems, `order-${Date.now()}`);

      if (inventoryResult.success) {
        setCheckoutState('success');
        setCheckoutMessage(`Order complete! ${inventoryResult.summary?.outOfStockNow || 0} items now out of stock.`);
        
        // Clear cart after 2 seconds
        setTimeout(() => {
          clearCart();
          setCartOpen(false);
          setCheckoutState('idle');
          setCheckoutMessage('');
        }, 2000);
      } else {
        setCheckoutState('error');
        setCheckoutMessage(inventoryResult.error || 'Failed to process order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutState('error');
      setCheckoutMessage(error.message || 'An error occurred during checkout');
    }
  };

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
                 {checkoutState !== 'idle' && (
                   <div className={`p-3 rounded-lg flex items-start gap-2 ${
                     checkoutState === 'success' ? 'bg-green-50' :
                     checkoutState === 'error' ? 'bg-red-50' :
                     'bg-blue-50'
                   }`}>
                     {checkoutState === 'success' && (
                       <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                     )}
                     {checkoutState === 'error' && (
                       <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                     )}
                     {(checkoutState === 'validating' || checkoutState === 'processing') && (
                       <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin mt-0.5" />
                     )}
                     <p className={`text-sm ${
                       checkoutState === 'success' ? 'text-green-800' :
                       checkoutState === 'error' ? 'text-red-800' :
                       'text-blue-800'
                     }`}>
                       {checkoutMessage}
                     </p>
                   </div>
                 )}

                 <div className="flex items-center justify-between">
                   <span className="font-medium text-slate-900">Total:</span>
                   <span className="text-lg font-bold text-slate-900">
                     ${cartTotal.toFixed(2)}
                   </span>
                 </div>
                 <Button
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                   onClick={handleCheckout}
                   disabled={checkoutState !== 'idle' && checkoutState !== 'error'}
                 >
                   {checkoutState === 'idle' || checkoutState === 'error' ? 'Proceed to Checkout' : 'Processing...'}
                 </Button>
                 <Button
                   variant="outline"
                   className="w-full"
                   onClick={clearCart}
                   disabled={checkoutState !== 'idle' && checkoutState !== 'error'}
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