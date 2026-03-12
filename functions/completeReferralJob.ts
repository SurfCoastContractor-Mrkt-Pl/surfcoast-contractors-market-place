import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { referralCode } = await req.json();

    if (!referralCode) {
      return Response.json({ error: 'Referral code required' }, { status: 400 });
    }

    // Find and update referral
    const referrals = await base44.asServiceRole.entities.Referral.filter({
      referral_code: referralCode,
      status: 'signed_up'
    });

    if (!referrals || referrals.length === 0) {
      return Response.json({ success: true, message: 'Referral not found or already completed' });
    }

    const referral = referrals[0];

    // Mark as completed
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      status: 'completed_first_job',
      credits_earned: 50,
      completed_at: new Date().toISOString(),
    });

    // Send celebratory email to referrer
    await base44.integrations.Core.SendEmail({
      to: referral.referrer_email,
      subject: 'You Earned $50 Credit! 🎉',
      body: `Congratulations! ${referral.referred_name || referral.referred_email} just completed their first job on SurfCoast.\n\nYou've earned $50 credit that you can use toward messaging, featured listings, or other services.\n\nThanks for growing the SurfCoast community!\n\nSurfCoast Team`,
      from_name: 'SurfCoast',
    });

    console.log(`✓ Referral completed for ${referral.referred_email}`);

    return Response.json({
      success: true,
      message: 'Referral marked as completed',
      credits_earned: 50,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});