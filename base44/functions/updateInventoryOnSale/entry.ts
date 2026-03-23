import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Updates inventory when items are sold
 * Called after successful payment to decrease quantity_available
 * and mark items as sold_out if inventory reaches zero
 * 
 * Payload: {
 *   cartItems: [{ id, quantity }, ...],
 *   orderId: "order_123" (optional, for tracking)
 * }
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Validate internal service key — only internal payment processes may call this
    const internalKey = req.headers.get('x-internal-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!expectedKey || internalKey !== expectedKey) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const base44 = createClientFromRequest(req);
    const { cartItems, orderId } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return Response.json(
        { error: 'Invalid or empty cartItems' },
        { status: 400 }
      );
    }

    console.log(`[Inventory Update] Processing ${cartItems.length} items from order: ${orderId || 'unknown'}`);

    const updatedListings = [];
    const errors = [];

    // Process each item in the cart
    for (const item of cartItems) {
      try {
        if (!item.id || !item.quantity) {
          errors.push({ itemId: item.id, error: 'Missing id or quantity' });
          continue;
        }

        // Fetch current listing
        const listings = await base44.asServiceRole.entities.MarketListing.filter({
          id: item.id
        });

        if (!listings || listings.length === 0) {
          errors.push({ itemId: item.id, error: 'Listing not found' });
          continue;
        }

        const listing = listings[0];
        const currentQuantity = listing.quantity_available || 0;
        const newQuantity = Math.max(0, currentQuantity - item.quantity);
        const isNowOutOfStock = newQuantity === 0;

        // Update the listing
        await base44.asServiceRole.entities.MarketListing.update(listing.id, {
          quantity_available: newQuantity,
          status: isNowOutOfStock ? 'sold_out' : listing.status || 'active'
        });

        updatedListings.push({
          id: listing.id,
          product_name: listing.product_name,
          quantitySold: item.quantity,
          newQuantity,
          outOfStock: isNowOutOfStock
        });

        console.log(`[Inventory] Updated "${listing.product_name}": -${item.quantity} (new: ${newQuantity})${isNowOutOfStock ? ' [SOLD OUT]' : ''}`);
      } catch (error) {
        console.error(`[Inventory Error] Failed to update item ${item.id}:`, error.message);
        errors.push({
          itemId: item.id,
          error: error.message
        });
      }
    }

    const response = {
      success: errors.length === 0,
      updated: updatedListings,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        processed: cartItems.length,
        successful: updatedListings.length,
        failed: errors.length,
        outOfStockNow: updatedListings.filter(u => u.outOfStock).length
      }
    };

    console.log('[Inventory Update] Complete:', JSON.stringify(response.summary));

    return Response.json(response, {
      status: errors.length > 0 && updatedListings.length === 0 ? 400 : 200
    });
  } catch (error) {
    console.error('[Inventory Update] Critical error:', error);
    return Response.json(
      { error: error.message || 'Failed to update inventory' },
      { status: 500 }
    );
  }
});