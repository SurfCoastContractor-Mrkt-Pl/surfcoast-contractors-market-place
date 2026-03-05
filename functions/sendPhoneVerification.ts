import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Simple in-memory storage for verification codes (use database in production)
const verificationStore = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { phone, userEmail } = body;

    if (!phone || !userEmail) {
      return Response.json({ error: 'Phone and email required' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/\D/g, '');

    // Check if customer profile exists and if phone matches (optional, not required for new users)
    const profiles = await base44.asServiceRole.entities.CustomerProfile.filter({
      email: userEmail
    });

    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      const profilePhone = profile.phone ? profile.phone.replace(/\D/g, '') : '';

      // If profile exists with phone, verify it matches
      if (profilePhone && normalizedPhone !== profilePhone) {
        console.warn(`Phone mismatch for ${userEmail}: provided=${normalizedPhone}, profile=${profilePhone}`);
        return Response.json({ 
          error: 'This phone number is not associated with your account' 
        }, { status: 400 });
      }
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with 5 minute expiry
    const expiresAt = Date.now() + 5 * 60 * 1000;
    verificationStore.set(`${userEmail}-${normalizedPhone}`, { code, expiresAt });

    // In production, send SMS via Twilio or similar service
    // For demo, log the code
    console.log(`Verification code for ${userEmail} (${phone}): ${code}`);

    return Response.json({ 
      success: true, 
      message: 'Verification code sent to your phone'
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});