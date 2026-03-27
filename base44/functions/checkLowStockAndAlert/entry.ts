import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { listing_id } = await req.json();

    if (!listing_id) {
      return Response.json({ error: 'Missing listing_id' }, { status: 400 });
    }

    // Get the listing
    const listing = await base44.entities.MarketListing.get(listing_id);

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if stock is low and alert hasn't been sent recently
    const isLow = listing.stock_level <= listing.low_stock_threshold;
    const lastAlertSent = listing.last_low_stock_alert_sent
      ? new Date(listing.last_low_stock_alert_sent)
      : null;
    const now = new Date();
    const hoursSinceLastAlert = lastAlertSent ? (now - lastAlertSent) / (1000 * 60 * 60) : 24;

    if (isLow && hoursSinceLastAlert >= 24) {
      // Send low stock email alert
      await base44.integrations.Core.SendEmail({
        to: listing.shop_email,
        subject: `Low Stock Alert: ${listing.product_name}`,
        body: `
Your product "${listing.product_name}" is running low on stock.

Current Stock: ${listing.stock_level} ${listing.unit || 'units'}
Low Stock Threshold: ${listing.low_stock_threshold}

Please restock soon to avoid losing sales. Visit your inventory dashboard to update stock levels.

Product: ${listing.product_name}
Price: $${listing.price}

Manage your inventory: https://app.surfcoast.com/market-shop-inventory
        `.trim(),
      });

      // Update last alert timestamp
      await base44.entities.MarketListing.update(listing_id, {
        last_low_stock_alert_sent: now.toISOString(),
      });

      return Response.json({
        success: true,
        alert_sent: true,
        message: 'Low stock alert sent',
      });
    }

    return Response.json({
      success: true,
      alert_sent: false,
      reason: isLow ? 'Alert sent recently' : 'Stock level is adequate',
    });
  } catch (error) {
    console.error('Error checking stock:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});