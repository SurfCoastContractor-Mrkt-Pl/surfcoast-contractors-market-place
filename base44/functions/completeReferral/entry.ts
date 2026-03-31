import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Mark a referral as completed when referred user reaches 100% profile completion.
 * Checks profile completeness across Contractor, CustomerProfile, and MarketShop.
 * Extends trial by 1 day for the referrer (any profile type).
 * Only callable via internal service key or admin.
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
    const base44 = createClientFromRequest(req);

    // Admin or internal automation only
    const internalKey = req.headers.get('x-internal-service-key');
    const isValidInternalCall = internalKey && internalKey === Deno.env.get('INTERNAL_SERVICE_KEY');

    if (!isValidInternalCall) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: admin or internal access only' }, { status: 403 });
      }
    }

    const { referred_email } = await req.json();

    if (!referred_email) {
      return Response.json({ error: 'referred_email is required' }, { status: 400 });
    }

    // --- 1. Verify referred user's profile is actually complete ---
    let profileComplete = false;

    const [contractors, clientProfiles, vendorProfiles] = await Promise.all([
      base44.asServiceRole.entities.Contractor.filter({ email: referred_email }),
      base44.asServiceRole.entities.CustomerProfile.filter({ email: referred_email }),
      base44.asServiceRole.entities.MarketShop.filter({ email: referred_email }),
    ]);

    if (contractors?.length > 0 && isContractorProfileComplete(contractors[0])) profileComplete = true;
    if (clientProfiles?.length > 0 && isClientProfileComplete(clientProfiles[0])) profileComplete = true;
    if (vendorProfiles?.length > 0 && isVendorProfileComplete(vendorProfiles[0])) profileComplete = true;

    if (!profileComplete) {
      return Response.json({
        error: 'Referred user profile is not yet complete. All required fields must be filled.',
        required_fields: 'full name, email, phone, photo, address/city, bio/description'
      }, { status: 422 });
    }

    // --- 2. Find pending referral for this referred user ---
    const referrals = await base44.asServiceRole.entities.Referral.filter({
      referred_email: referred_email,
      status: 'signed_up'
    });

    if (!referrals || referrals.length === 0) {
      return Response.json({ error: 'No pending referral found for this user' }, { status: 404 });
    }

    const referral = referrals[0];

    // --- 3. Mark referral as profile_completed ---
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      status: 'profile_completed',
      completed_at: new Date().toISOString()
    });

    // --- 4. Extend referrer trial by 1 day — check all profile types ---
    const referrerEmail = referral.referrer_email;

    const [referrerContractors, referrerClients, referrerVendors] = await Promise.all([
      base44.asServiceRole.entities.Contractor.filter({ email: referrerEmail }),
      base44.asServiceRole.entities.CustomerProfile.filter({ email: referrerEmail }),
      base44.asServiceRole.entities.MarketShop.filter({ email: referrerEmail }),
    ]);

    const extendTrial = async (entity, entityName, record) => {
      if (record.trial_active && record.trial_ends_at) {
        const newEnd = new Date(new Date(record.trial_ends_at).getTime() + 24 * 60 * 60 * 1000);
        await base44.asServiceRole.entities[entityName].update(record.id, {
          trial_ends_at: newEnd.toISOString()
        });
        console.log(`Trial extended for ${referrerEmail} (${entityName}) to ${newEnd.toISOString()}`);
        return true;
      }
      return false;
    };

    let trialExtended = false;
    if (referrerContractors?.length > 0) trialExtended = await extendTrial(null, 'Contractor', referrerContractors[0]);
    if (!trialExtended && referrerClients?.length > 0) trialExtended = await extendTrial(null, 'CustomerProfile', referrerClients[0]);
    if (!trialExtended && referrerVendors?.length > 0) trialExtended = await extendTrial(null, 'MarketShop', referrerVendors[0]);

    // --- 5. Increment active referral campaign counter ---
    try {
      const activeCampaigns = await base44.asServiceRole.entities.Campaign.filter({ status: 'active', type: 'referral' });
      if (activeCampaigns?.length > 0) {
        await base44.asServiceRole.entities.Campaign.update(activeCampaigns[0].id, {
          current_signups: (activeCampaigns[0].current_signups || 0) + 1
        });
      }
    } catch (e) {
      console.warn('Campaign counter update failed:', e.message);
    }

    return Response.json({
      status: 'profile_completed',
      referrer_email: referrerEmail,
      trial_extended: trialExtended,
      message: 'Referral completed — profile verified complete, trial extended by 1 day'
    });

  } catch (error) {
    console.error('Complete referral error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});