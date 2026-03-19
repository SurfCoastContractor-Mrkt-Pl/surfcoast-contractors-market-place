import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Must be authenticated — the referred user must be signing up themselves
    const internalKey = req.headers.get('x-internal-service-key');
    const isValidInternalCall = internalKey && internalKey === Deno.env.get('INTERNAL_SERVICE_KEY');

    if (!isValidInternalCall) {
      const user = await base44.auth.me().catch(() => null);
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Store for email match check below
      var callerEmail = user.email;
    }

    const { referral_code, referred_email, referred_name } = await req.json();

    if (!referral_code || !referred_email) {
      return Response.json({ error: 'Missing referral_code or referred_email' }, { status: 400 });
    }

    // Prevent spoofing — referred_email must match the authenticated user (unless internal)
    if (!isValidInternalCall && referred_email.toLowerCase() !== callerEmail.toLowerCase()) {
      return Response.json({ error: 'Forbidden: referred email must match your account' }, { status: 403 });
    }

    // Find referral record by code
    const referrals = await base44.asServiceRole.entities.Referral.filter({
      referral_code: referral_code.toUpperCase()
    });

    if (!referrals || referrals.length === 0) {
      return Response.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    const referral = referrals[0];

    // Check if already tracked
    if (referral.referred_email === referred_email) {
      return Response.json({
        status: referral.status,
        message: 'Referral already tracked'
      });
    }

    // Update referral with referred user info
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      referred_email: referred_email,
      referred_name: referred_name || referred_email.split('@')[0],
      status: 'signed_up'
    });

    console.log(`Referral tracked: ${referred_email} via code ${referral_code}`);

    return Response.json({
      status: 'signed_up',
      referrer_email: referral.referrer_email,
      message: 'Referral tracked successfully'
    });
  } catch (error) {
    console.error('Track referral signup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});