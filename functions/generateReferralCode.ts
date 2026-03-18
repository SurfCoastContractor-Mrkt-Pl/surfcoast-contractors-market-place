import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an active referral code
    const existing = await base44.entities.Referral.filter({
      referrer_email: user.email
    });

    if (existing.length > 0) {
      const active = existing[0];
      return Response.json({
        referral_code: active.referral_code,
        referrer_email: active.referrer_email,
        referrer_name: active.referrer_name,
        created_date: active.created_date
      });
    }

    // Generate unique referral code (8 chars alphanumeric)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create referral record
    const referral = await base44.entities.Referral.create({
      referrer_email: user.email,
      referrer_name: user.full_name || user.email.split('@')[0],
      referral_code: code,
      referred_at: new Date().toISOString()
    });

    return Response.json({
      referral_code: code,
      referrer_email: user.email,
      referrer_name: user.full_name,
      created_date: referral.created_date
    });
  } catch (error) {
    console.error('Generate referral code error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});