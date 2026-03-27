import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { order_id } = await req.json();

    if (!order_id) {
      return Response.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // Get the order
    const order = await base44.asServiceRole.entities.ConsumerOrder.get(order_id);

    if (!order || !order.items) {
      return Response.json({ error: 'Order not found or has no items' }, { status: 404 });
    }

    // Update stock for each item in the order
    const updatePromises = order.items.map(async (item) => {
      const listings = await base44.asServiceRole.entities.MarketListing.filter({
        id: item.listing_id,
      });

      if (listings && listings.length > 0) {
        const listing = listings[0];
        const newStock = Math.max(0, listing.stock_level - item.quantity);

        // Update stock and visibility
        const updated = await base44.asServiceRole.entities.MarketListing.update(listing.id, {
          stock_level: newStock,
          is_visible: newStock > 0,
        });

        // Check for low stock alert
        if (newStock <= listing.low_stock_threshold && newStock > 0) {
          await base44.functions.invoke('checkLowStockAndAlert', {
            listing_id: listing.id,
          });
        }

        return { listing_id: listing.id, new_stock: newStock };
      }

      return null;
    });

    const results = await Promise.all(updatePromises);

    return Response.json({
      success: true,
      message: 'Stock updated for all items',
      updated_items: results.filter((r) => r !== null),
    });
  } catch (error) {
    console.error('Error updating stock on order:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});