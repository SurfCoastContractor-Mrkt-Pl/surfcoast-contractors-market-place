import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { referralCode, newUserEmail, newUserName } = await req.json();

    if (!referralCode || !newUserEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user is tracking their own referral signup
    if (user.email !== newUserEmail) {
      return Response.json(
        { error: 'Unauthorized - can only track your own referral signup' },
        { status: 403 }
      );
    }

    // Find referrer from referral code
    const referrals = await base44.asServiceRole.entities.Referral.filter({ 
      referral_code: referralCode 
    });

    if (!referrals || referrals.length === 0) {
      console.log('Invalid referral code:', referralCode);
      return Response.json({ success: true, message: 'Code not found, continuing signup' });
    }

    const referrerData = referrals[0];

    // Create referred record
    const referred = await base44.asServiceRole.entities.Referral.create({
      referrer_email: referrerData.referrer_email,
      referrer_name: referrerData.referrer_name,
      referred_email: newUserEmail,
      referred_name: newUserName || newUserEmail,
      referral_code: referralCode,
      status: 'signed_up',
      referred_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: 'Referral tracked',
      referral_id: referred.id,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});