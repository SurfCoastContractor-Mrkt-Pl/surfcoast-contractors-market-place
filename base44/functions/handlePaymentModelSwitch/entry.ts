import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shop_id, new_model } = await req.json();

    if (!shop_id || !new_model) {
      return Response.json({ error: 'Missing shop_id or new_model' }, { status: 400 });
    }

    // Fetch the shop and verify ownership
    const shops = await base44.asServiceRole.entities.MarketShop.filter({ id: shop_id });
    const shop = shops?.[0];

    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (shop.email !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the shop's payment model directly
    await base44.asServiceRole.entities.MarketShop.update(shop_id, {
      payment_model: new_model,
    });

    console.log(`Payment model switched to ${new_model} for shop ${shop_id} (${user.email})`);

    return Response.json({ success: true, new_model });
  } catch (error) {
    console.error('Payment model switch error:', error);
    return Response.json({ error: error.message || 'Failed to process payment model switch' }, { status: 500 });
  }
});