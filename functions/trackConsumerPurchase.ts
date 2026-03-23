import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const BADGE_INTERVAL = 15000; // $150 in cents

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount_cents, shop_type, shop_id, listing_id, item_name } = await req.json();

    if (!amount_cents || amount_cents <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // shop_type: 'farmers_market' (booth) or 'swap_meet' (vendor)
    const isVendor = shop_type === 'swap_meet';
    const isBooth = shop_type === 'farmers_market';

    // Fetch or create ConsumerTier record
    const existing = await base44.asServiceRole.entities.ConsumerTier.filter({ user_email: user.email });
    let tier = existing?.[0];

    const prevTotal = tier?.total_spent || 0;
    const newTotal = prevTotal + amount_cents;

    const prevVendorSpent = tier?.vendor_spent || 0;
    const prevBoothSpent = tier?.booth_spent || 0;
    const newVendorSpent = isVendor ? prevVendorSpent + amount_cents : prevVendorSpent;
    const newBoothSpent = isBooth ? prevBoothSpent + amount_cents : prevBoothSpent;

    // Calculate badges
    const prevBadgeCount = Math.floor(prevTotal / BADGE_INTERVAL);
    const newBadgeCount = Math.floor(newTotal / BADGE_INTERVAL);
    const newBadgesEarned = [...(tier?.badges_earned || [])];
    const badgesAwarded = [];

    for (let i = prevBadgeCount + 1; i <= newBadgeCount; i++) {
      const vendorRatio = newTotal > 0 ? newVendorSpent / newTotal : 0;
      const boothRatio = newTotal > 0 ? newBoothSpent / newTotal : 0;
      let category = 'mixed';
      if (vendorRatio >= 0.7) category = 'vendors';
      else if (boothRatio >= 0.7) category = 'booths';

      const badge = {
        badge_number: i,
        category,
        amount_spent: i * BADGE_INTERVAL,
        earned_at: new Date().toISOString(),
      };
      newBadgesEarned.push(badge);
      badgesAwarded.push(badge);
    }

    const updateData = {
      total_spent: newTotal,
      vendor_spent: newVendorSpent,
      booth_spent: newBoothSpent,
      current_tier: newBadgeCount,
      badges_earned: newBadgesEarned,
      last_purchase_at: new Date().toISOString(),
    };

    if (tier) {
      await base44.asServiceRole.entities.ConsumerTier.update(tier.id, updateData);
    } else {
      await base44.asServiceRole.entities.ConsumerTier.create({
        user_email: user.email,
        ...updateData,
      });
    }

    return Response.json({
      success: true,
      new_total_cents: newTotal,
      badges_awarded: badgesAwarded,
      total_badges: newBadgesEarned.length,
    });
  } catch (error) {
    console.error('trackConsumerPurchase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});