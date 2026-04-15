import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Automation trigger — called when a Contractor, CustomerProfile, or MarketShop is updated.
 * Checks if the profile is now fully complete and fires completeReferral if so.
 * 
 * Wire this up as an entity automation on:
 *   - Contractor (update)
 *   - CustomerProfile (update)
 *   - MarketShop (update)
 */

function isContractorProfileComplete(p) {
  return !!(p.name && p.email && p.phone && p.photo_url && p.location && p.bio);
}

function isClientProfileComplete(p) {
  return !!(p.full_name && p.email && p.phone && p.photo_url && p.property_address && p.bio);
}

function isVendorProfileComplete(p) {
  return !!(p.owner_name && p.email && p.owner_phone && p.profile_photo_url && p.city && p.description);
}

Deno.serve(async (req) => {
  try {
    // Validate internal service key — only trusted automation triggers are allowed
    const internalKey = req.headers.get('x-internal-key');
    if (!internalKey || internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      console.warn('[onProfileCompleted] Rejected request with invalid or missing internal key');
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;

    if (!data || event?.type !== 'update') {
      return Response.json({ skipped: true, reason: 'Not an update event or no data' });
    }

    const entityName = event?.entity_name;
    const email = data.email;

    if (!email) {
      return Response.json({ skipped: true, reason: 'No email on entity' });
    }

    // Check if this profile is now complete
    let isComplete = false;
    if (entityName === 'Contractor') isComplete = isContractorProfileComplete(data);
    else if (entityName === 'CustomerProfile') isComplete = isClientProfileComplete(data);
    else if (entityName === 'MarketShop') isComplete = isVendorProfileComplete(data);

    if (!isComplete) {
      return Response.json({ skipped: true, reason: 'Profile not yet complete' });
    }

    // Check if there's a pending referral for this user
    const referrals = await base44.asServiceRole.entities.Referral.filter({
      referred_email: email,
      status: 'signed_up'
    });

    if (!referrals || referrals.length === 0) {
      return Response.json({ skipped: true, reason: 'No pending referral found for this user' });
    }

    // Fire completeReferral via internal service call
    const result = await base44.asServiceRole.functions.invoke('completeReferral', {
      referred_email: email
    });

    console.log(`Profile completion referral triggered for ${email}:`, result);

    return Response.json({ success: true, email, result });

  } catch (error) {
    console.error('onProfileCompleted error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});