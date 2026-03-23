import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Download, RotateCcw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useConsumerMode } from '@/lib/ConsumerModeContext';

const SHOP_TYPE_LABELS = {
  farmers_market: '🌽 Farmers Market',
  swap_meet: '🏷️ Swap Meet',
  both: '🌽🏷️ Both',
};

export default function MyOrders({ userEmail }) {
  const { addToCart, setCartOpen } = useConsumerMode();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['consumer-orders', userEmail],
    queryFn: () =>
      base44.entities.ConsumerOrder.filter({ consumer_email: userEmail }, '-placed_at', 50),
    enabled: !!userEmail,
  });

  const handleDownloadReceipt = async (order) => {
    setDownloadingId(order.id);
    try {
      const response = await base44.functions.invoke('generateConsumerReceipt', { order_id: order.id });
      // The function returns raw PDF bytes via axios
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${order.order_number || order.id.substring(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Receipt download failed:', err);
      alert('Could not generate receipt. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReorder = (order) => {
    for (const item of order.items || []) {
      addToCart({
        id: item.listing_id,
        product_name: item.product_name,
        price: item.price,
        unit: item.unit,
        image_url: item.image_url,
        shop_id: order.shop_id,
        shop_name: order.shop_name,
        quantity: item.quantity,
      });
    }
    setCartOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No orders yet</p>
        <p className="text-slate-500 text-sm mt-1">Your purchase history will appear here after checkout.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>

      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        const orderDate = new Date(order.placed_at || order.created_date);

        return (
          <Card key={order.id} className="overflow-hidden">
            {/* Order Header */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900 text-sm">
                    {order.order_number || `#${order.id.substring(0, 10).toUpperCase()}`}
                  </span>
                  <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">
                    {order.status || 'completed'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {SHOP_TYPE_LABELS[order.shop_type] || order.shop_type}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-800">{order.shop_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}
                  {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  {' · '}
                  <span className="font-semibold text-slate-700">${(order.total || 0).toFixed(2)}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReorder(order)}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Re-order
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadReceipt(order)}
                  disabled={downloadingId === order.id}
                  className="gap-1.5 text-xs"
                >
                  {downloadingId === order.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  Receipt
                </Button>
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Items */}
            {isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-500">
                        ${(item.price || 0).toFixed(2)} {item.unit} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 flex-shrink-0">
                      ${(item.subtotal || item.price * item.quantity || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-end pt-2 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-900">
                    Total: ${(order.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}