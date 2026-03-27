import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listing_id, new_stock_level } = await req.json();

    if (!listing_id || new_stock_level === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the listing
    const listing = await base44.entities.MarketListing.get(listing_id);

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Verify ownership
    if (listing.shop_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update stock level
    const updated = await base44.entities.MarketListing.update(listing_id, {
      stock_level: new_stock_level,
      is_visible: new_stock_level > 0 ? true : false, // Hide if out of stock
    });

    return Response.json({
      success: true,
      listing: updated,
    });
  } catch (error) {
    console.error('Error updating stock:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});