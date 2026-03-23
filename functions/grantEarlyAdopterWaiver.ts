import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, full_name, signup_type } = await req.json();

    if (!email || !full_name || !signup_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Count existing early adopter waivers
    const existingWaivers = await base44.asServiceRole.entities.EarlyAdopterWaiver.list();
    const waiverCount = existingWaivers ? existingWaivers.length : 0;

    // Check if user qualifies (first 100 only)
    if (waiverCount >= 100) {
      return Response.json({ 
        qualified: false, 
        message: 'Early adopter spots are full' 
      });
    }

    // Create waiver record
    const waiver = await base44.asServiceRole.entities.EarlyAdopterWaiver.create({
      email,
      full_name,
      signup_type,
      claimed_at: new Date().toISOString(),
    });

    // Send notification email
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: '🎉 You\'re an Early Adopter! Exclusive Benefits Unlocked',
      body: `Hi ${full_name},

Welcome to SurfCoast Marketplace! You're one of the first 100 users to sign up, which means you've unlocked exclusive early adopter benefits:

✨ **Your Early Adopter Benefits:**
• Permanently reduced platform fees (starting at just 1.5% instead of standard 18%)
• Priority support and feature access
• Lifetime early adopter badge on your profile
• Exclusive access to beta features as we grow

We're building something special, and we're grateful to have you as part of our founding community.

Get started now and make the most of your exclusive perks!

Best regards,
The SurfCoast Team`
    });

    return Response.json({
      qualified: true,
      waiverCount: waiverCount + 1,
      message: `Welcome to the early adopter community! (${waiverCount + 1}/100)`
    });
  } catch (error) {
    console.error('Error granting early adopter waiver:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});