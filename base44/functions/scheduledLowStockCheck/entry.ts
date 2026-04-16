import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Validate internal service key — this endpoint is for scheduled automation only
    const serviceKey = req.headers.get('x-internal-service-key');
    if (serviceKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Scheduled automation — runs without user context. Uses asServiceRole for all DB ops.

    // Get all listings with stock at or below threshold
    const listings = await base44.asServiceRole.entities.MarketListing.filter({});

    if (!listings || listings.length === 0) {
      return Response.json({
        success: true,
        message: 'No listings found',
        checked: 0,
        alerted: 0,
      });
    }

    let alerted = 0;

    // Check each listing
    for (const listing of listings) {
      const isLow = listing.stock_level <= listing.low_stock_threshold;
      const lastAlertSent = listing.last_low_stock_alert_sent
        ? new Date(listing.last_low_stock_alert_sent)
        : null;
      const now = new Date();
      const hoursSinceLastAlert = lastAlertSent ? (now - lastAlertSent) / (1000 * 60 * 60) : 24;

      if (isLow && hoursSinceLastAlert >= 24) {
        try {
          // Send email alert
          await base44.integrations.Core.SendEmail({
            to: listing.shop_email,
            subject: `Low Stock Alert: ${listing.product_name}`,
            body: `
Your product "${listing.product_name}" is running low on stock.

Current Stock: ${listing.stock_level} ${listing.unit || 'units'}
Low Stock Threshold: ${listing.low_stock_threshold}

Please restock soon to avoid losing sales.

Product: ${listing.product_name}
Price: $${listing.price}
Category: ${listing.category || 'N/A'}

Manage your inventory: https://app.surfcoast.com/market-shop-inventory
            `.trim(),
          });

          // Update last alert timestamp
          await base44.asServiceRole.entities.MarketListing.update(listing.id, {
            last_low_stock_alert_sent: now.toISOString(),
          });

          alerted++;
        } catch (error) {
          console.error(`Failed to alert for listing ${listing.id}:`, error.message);
        }
      }
    }

    return Response.json({
      success: true,
      message: 'Low stock check completed',
      checked: listings.length,
      alerted,
    });
  } catch (error) {
    console.error('Error in scheduled low stock check:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});