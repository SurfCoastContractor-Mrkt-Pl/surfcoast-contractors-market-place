import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Mark a referral as completed when referred user reaches 100% profile completion
 * Called by profile completion automation or manually
 */
Deno.serve(async (req) => {
  try {
    const { referred_email } = await req.json();

    if (!referred_email) {
      return Response.json({ error: 'referred_email is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Find referral by referred email
    const referrals = await base44.asServiceRole.entities.Referral.filter({
      referred_email: referred_email,
      status: 'signed_up'
    });

    if (!referrals || referrals.length === 0) {
      return Response.json({ error: 'No pending referral found' }, { status: 404 });
    }

    const referral = referrals[0];

    // Mark as completed
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      status: 'completed_first_job',
      completed_at: new Date().toISOString()
    });

    // Get referrer's profile to extend trial
    const referrerProfiles = await base44.asServiceRole.entities.Contractor.filter({
      email: referral.referrer_email
    });

    if (referrerProfiles && referrerProfiles.length > 0) {
      const profile = referrerProfiles[0];
      if (profile.trial_active && profile.trial_ends_at) {
        const currentEnd = new Date(profile.trial_ends_at);
        const newEnd = new Date(currentEnd.getTime() + 24 * 60 * 60 * 1000); // +1 day
        await base44.asServiceRole.entities.Contractor.update(profile.id, {
          trial_ends_at: newEnd.toISOString()
        });
        console.log(`Trial extended for ${referral.referrer_email} to ${newEnd.toISOString()}`);
      }
    }

    // Increment active campaign signup counter
    try {
      const activeCampaigns = await base44.asServiceRole.entities.Campaign.filter({
        status: 'active',
        type: 'referral'
      });

      if (activeCampaigns && activeCampaigns.length > 0) {
        const campaign = activeCampaigns[0];
        await base44.asServiceRole.entities.Campaign.update(campaign.id, {
          current_signups: (campaign.current_signups || 0) + 1
        });
        console.log(`Campaign signup counter incremented: ${campaign.name}`);
      }
    } catch (e) {
      console.warn('Campaign counter update failed:', e.message);
    }

    return Response.json({
      status: 'completed_first_job',
      referrer_email: referral.referrer_email,
      message: 'Referral completed and trial extended by 1 day'
    });
  } catch (error) {
    console.error('Complete referral error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});