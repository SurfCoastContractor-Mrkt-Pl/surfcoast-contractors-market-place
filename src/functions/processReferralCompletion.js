import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
/**
 * Process successful referral completion
 * When a referred user completes signup, increment referrer's successful_referral_count
 * If count reaches 5 (during trial), extend trial by 5 days total
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { referrerEmail, referrerType, referredEmail } = body;

    if (!referrerEmail || !referrerType || !referredEmail) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const entityName = referrerType === 'contractor' ? 'Contractor' : 'CustomerProfile';

    // Get referrer record
    const referrers = await base44.asServiceRole.entities[entityName].filter({
      email: referrerEmail,
    });

    if (referrers.length === 0) {
      return Response.json({ error: 'Referrer not found' }, { status: 404 });
    }

    const referrer = referrers[0];
    const currentCount = referrer.successful_referral_count || 0;
    const newCount = currentCount + 1;

    // Check if trial is still active
    const now = new Date();
    const trialEndDate = referrer.trial_ends_at ? new Date(referrer.trial_ends_at) : null;
    const isTrialActive = trialEndDate && trialEndDate > now;

    let updatedFields = {
      successful_referral_count: newCount,
    };

    // If trial is active and this is the 5th referral, extend trial
    if (isTrialActive && newCount === 5) {
      const newTrialEnd = new Date(trialEndDate);
      newTrialEnd.setDate(newTrialEnd.getDate() + 5); // Add 5 days
      updatedFields.trial_ends_at = newTrialEnd.toISOString();
    }

    await base44.asServiceRole.entities[entityName].update(referrer.id, updatedFields);

    return Response.json({
      success: true,
      referralCount: newCount,
      trialExtended: isTrialActive && newCount === 5,
      message: isTrialActive && newCount === 5
        ? 'Congratulations! Your trial extended by 5 days!'
        : `Referral ${newCount}/5 recorded`,
    });
  } catch (error) {
    console.error('processReferralCompletion error:', error.message);
    return Response.json(
      { error: 'Failed to process referral', details: error.message },
      { status: 500 }
    );
  }
});