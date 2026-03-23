import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, user_type } = await req.json();

    if (!email || !user_type || !['contractor', 'customer'].includes(user_type)) {
      return Response.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    // Count existing approved early adopter waivers
    const existingWaivers = await base44.asServiceRole.entities.EarlyAdopterWaiver.filter({
      is_eligible: true
    });
    const waiverCount = existingWaivers ? existingWaivers.length : 0;

    // Check if user already has a waiver
    const userWaivers = await base44.asServiceRole.entities.EarlyAdopterWaiver.filter({
      user_email: email
    });
    
    if (userWaivers && userWaivers.length > 0) {
      return Response.json({ 
        qualified: false, 
        message: 'User already has an early adopter waiver' 
      }, { status: 400 });
    }

    // Check if spots are available (first 100 only)
    if (waiverCount >= 100) {
      return Response.json({ 
        qualified: false, 
        message: 'Early adopter spots are full',
        claim_order: null
      });
    }

    // Calculate timestamps
    const claimedAt = new Date();
    const freeYearExpiresAt = new Date(claimedAt.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Create waiver record
    const waiver = await base44.asServiceRole.entities.EarlyAdopterWaiver.create({
      user_email: email,
      user_type: user_type,
      claimed_at: claimedAt.toISOString(),
      free_year_starts_at: claimedAt.toISOString(),
      free_year_expires_at: freeYearExpiresAt.toISOString(),
      claim_order: waiverCount + 1,
      is_eligible: true,
      waiver_status: 'approved',
      contractor_lifetime_fee_rate: user_type === 'contractor' ? 8 : null,
      customer_reverts_to_standard: user_type === 'customer'
    });

    // Send notification email
    const benefitMessage = user_type === 'contractor' 
      ? `✨ **Your Early Adopter Benefits:**
• Free access for 1 year (all fees waived)
• After year 1: Permanent 8% facilitation fee (vs standard 18%)
• Priority support and feature access
• Lifetime early adopter badge on your profile`
      : `✨ **Your Early Adopter Benefits:**
• Free access for 1 year (all fees waived)
• After year 1: Standard pricing applies
• Priority support and feature access
• Lifetime early adopter badge on your profile`;

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: '🎉 You\'re an Early Adopter! Exclusive Benefits Unlocked',
      body: `Hi there,

Welcome to SurfCoast Marketplace! You're one of the first 100 users to sign up, which means you've unlocked exclusive early adopter benefits:

${benefitMessage}

Your free year expires on: ${freeYearExpiresAt.toLocaleDateString()}

We're building something special, and we're grateful to have you as part of our founding community.

Get started now and make the most of your exclusive perks!

Best regards,
The SurfCoast Team`
    });

    return Response.json({
      qualified: true,
      claim_order: waiverCount + 1,
      total_spots: 100,
      message: `Welcome to the early adopter community! (${waiverCount + 1}/100)`,
      free_year_expires_at: freeYearExpiresAt.toISOString(),
      user_type: user_type
    });
  } catch (error) {
    console.error('Error granting early adopter waiver:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});