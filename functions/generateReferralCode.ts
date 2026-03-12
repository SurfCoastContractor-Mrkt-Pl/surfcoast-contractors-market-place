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

    const body = await req.json();
    const { userEmail, userName } = body;

    if (!userEmail || !userName) {
      return Response.json({ error: 'Missing email or name' }, { status: 400 });
    }

    // Verify user is creating referral for their own email
    if (user.email !== userEmail) {
      return Response.json(
        { error: 'Can only create referral codes for your own account' },
        { status: 403 }
      );
    }

    // Generate unique referral code
    const code = `REF_${Math.random().toString(36).substring(2, 8).toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;

    // Create referral record for tracking own code
    const referral = await base44.entities.Referral.create({
      referrer_email: userEmail,
      referrer_name: userName,
      referral_code: code,
      status: 'pending',
      referred_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      referral_code: code,
      referral_id: referral.id,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});