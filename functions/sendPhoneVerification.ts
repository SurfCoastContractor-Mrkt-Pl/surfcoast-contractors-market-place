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

    // Verify customer profile exists for this email
    const profiles = await base44.asServiceRole.entities.CustomerProfile.filter({
      email: userEmail
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const normalizedPhone = phone.replace(/\D/g, '');
    
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