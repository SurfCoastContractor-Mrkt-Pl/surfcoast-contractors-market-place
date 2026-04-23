import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Automation trigger — called when a Contractor, CustomerProfile, or MarketShop is updated.
 * Checks if the profile is now fully complete and fires referral reward if so.
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

// Helper: validate this is a legitimate platform automation payload
function isValidAutomationPayload(payload) {
  return payload?.event?.type && payload?.event?.entity_name && payload?.event?.entity_id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Must be a legitimate platform automation — reject spoofed payloads
    if (!isValidAutomationPayload(payload)) {
      const serviceKey = req.headers.get('x-internal-key');
      if (!serviceKey || serviceKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

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

    const referral = referrals[0];

    // Mark referral as profile_completed
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      status: 'profile_completed',
      completed_at: new Date().toISOString()
    });

    console.log(`Referral ${referral.id} marked profile_completed for ${email}`);

    // Extend referrer trial by 1 day
    const referrerEmail = referral.referrer_email;
    let trialExtended = false;

    if (referrerEmail) {
      const [referrerContractors, referrerClients, referrerVendors] = await Promise.all([
        base44.asServiceRole.entities.Contractor.filter({ email: referrerEmail }),
        base44.asServiceRole.entities.CustomerProfile.filter({ email: referrerEmail }),
        base44.asServiceRole.entities.MarketShop.filter({ email: referrerEmail }),
      ]);

      const tryExtendTrial = async (entityName, records) => {
        if (trialExtended || !records?.length) return;
        const record = records[0];
        if (record.trial_active && record.trial_ends_at) {
          const newEnd = new Date(new Date(record.trial_ends_at).getTime() + 24 * 60 * 60 * 1000);
          await base44.asServiceRole.entities[entityName].update(record.id, {
            trial_ends_at: newEnd.toISOString()
          });
          console.log(`Trial extended for ${referrerEmail} (${entityName}) to ${newEnd.toISOString()}`);
          trialExtended = true;
        }
      };

      await tryExtendTrial('Contractor', referrerContractors);
      await tryExtendTrial('CustomerProfile', referrerClients);
      await tryExtendTrial('MarketShop', referrerVendors);
    }

    // Increment active referral campaign counter
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

    // Notify founding member if applicable
    if (data.is_founding_member === true) {
      try {
        await base44.asServiceRole.functions.invoke('notifyFoundingMemberBenefit', {
          contractor_email: email,
          contractor_name: data.name || data.owner_name || data.full_name
        });
        console.log(`Founding member benefit notification sent for ${email}`);
      } catch (notifyErr) {
        console.error(`Failed to notify founding member ${email}:`, notifyErr.message);
      }
    }

    return Response.json({
      success: true,
      email,
      referrer_email: referrerEmail,
      trial_extended: trialExtended
    });

  } catch (error) {
    console.error('onProfileCompleted error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});