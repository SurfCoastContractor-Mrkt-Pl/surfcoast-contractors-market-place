import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const BADGE_THRESHOLD = 15000; // $150 in cents

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, amount, purchase_type } = await req.json();

    if (!user_email || !amount || !purchase_type) {
      return Response.json(
        { error: 'Missing required fields: user_email, amount, purchase_type' },
        { status: 400 }
      );
    }

    // Validate purchase_type
    if (!['vendors', 'booths', 'mixed'].includes(purchase_type)) {
      return Response.json(
        { error: 'Invalid purchase_type. Must be vendors, booths, or mixed' },
        { status: 400 }
      );
    }

    // Get or create consumer tier
    const existingTiers = await base44.asServiceRole.entities.ConsumerTier.filter(
      { user_email }
    );
    let consumerTier = existingTiers?.[0];

    if (!consumerTier) {
      // Create new tier
      consumerTier = await base44.asServiceRole.entities.ConsumerTier.create({
        user_email,
        current_tier: 0,
        total_spent: amount,
        vendor_spent: purchase_type === 'vendors' ? amount : 0,
        booth_spent: purchase_type === 'booths' ? amount : 0,
        badges_earned: [],
        last_purchase_at: new Date().toISOString()
      });
    } else {
      // Update existing tier
      const previousTotal = consumerTier.total_spent || 0;
      const newTotal = previousTotal + amount;

      // Check if new badge earned
      const previousBadges = consumerTier.badges_earned?.length || 0;
      const newBadges = Math.floor(newTotal / BADGE_THRESHOLD);
      const badgesEarned = newBadges - previousBadges;

      const updatedBadges = consumerTier.badges_earned || [];
      
      // Add new badges if earned
      if (badgesEarned > 0) {
        for (let i = 0; i < badgesEarned; i++) {
          updatedBadges.push({
            badge_number: previousBadges + i + 1,
            category: purchase_type,
            amount_spent: newTotal,
            earned_at: new Date().toISOString()
          });
        }
      }

      // Update vendor/booth spending
      const vendorSpent = (consumerTier.vendor_spent || 0) + (purchase_type === 'vendors' ? amount : 0);
      const boothSpent = (consumerTier.booth_spent || 0) + (purchase_type === 'booths' ? amount : 0);

      consumerTier = await base44.asServiceRole.entities.ConsumerTier.update(
        consumerTier.id,
        {
          total_spent: newTotal,
          vendor_spent: vendorSpent,
          booth_spent: boothSpent,
          badges_earned: updatedBadges,
          current_tier: newBadges,
          last_purchase_at: new Date().toISOString()
        }
      );
    }

    return Response.json({
      success: true,
      consumerTier,
      newBadgesEarned: Math.max(0, Math.floor(consumerTier.total_spent / BADGE_THRESHOLD) - ((consumerTier.badges_earned?.length || 0)))
    });
  } catch (error) {
    console.error('Error in trackConsumerPurchase:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});