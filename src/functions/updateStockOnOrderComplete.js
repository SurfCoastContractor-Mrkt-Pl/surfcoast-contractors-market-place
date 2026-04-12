import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function runs as an entity automation (service role context)
    // No user auth check needed when invoked by automation
    
    const body = await req.json();
    const { scope_id, stock_updates } = body;
    
    if (!scope_id || !stock_updates || !Array.isArray(stock_updates)) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }
    
    let updatedCount = 0;
    
    for (const update of stock_updates) {
      const { listing_id, quantity } = update;
      
      if (!listing_id || typeof quantity !== 'number') {
        continue;
      }
      
      // Fetch the listing
      const listings = await base44.asServiceRole.entities.MarketListing.filter({
        id: listing_id
      });
      
      if (!listings || listings.length === 0) {
        continue;
      }
      
      const listing = listings[0];
      const currentStock = listing.data.stock_quantity || 0;
      const newStock = Math.max(0, currentStock - quantity);
      
      // Update the listing stock
      await base44.asServiceRole.entities.MarketListing.update(listing_id, {
        stock_quantity: newStock
      });
      
      updatedCount++;
      
      // Check if low stock threshold exists and is breached
      if (listing.data.low_stock_threshold && newStock < listing.data.low_stock_threshold) {
        // Create low stock notification for market shop
        await base44.asServiceRole.entities.LowStockNotification.create({
          contractor_id: listing.data.vendor_id,
          contractor_email: listing.data.vendor_email,
          inventory_item_id: listing_id,
          material_name: listing.data.title,
          current_quantity: newStock,
          low_stock_threshold: listing.data.low_stock_threshold,
          triggered_by: 'expense_deduction'
        });
      }
    }
    
    return Response.json({
      success: true,
      updatedCount,
      scope_id
    });
  } catch (error) {
    console.error('Error in updateStockOnOrderComplete:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});