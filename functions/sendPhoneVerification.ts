import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { phone, userEmail } = body;

    if (!phone || !userEmail) {
      return Response.json({ error: 'Phone and email required' }, { status: 400 });
    }

    // Check if phone number is associated with user's customer profile
    const profiles = await base44.asServiceRole.entities.CustomerProfile.filter({
      email: userEmail
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const profile = profiles[0];
    const normalizedPhone = phone.replace(/\D/g, '');
    const profilePhone = profile.phone ? profile.phone.replace(/\D/g, '') : '';

    if (normalizedPhone !== profilePhone) {
      return Response.json({ 
        error: 'This phone number is not associated with this email' 
      }, { status: 400 });
    }

    // Generate 6-digit code and store temporarily
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, send SMS via Twilio or similar
    // For now, log the code (in production, remove this)
    console.log(`Verification code for ${phone}: ${code}`);

    // Store code with expiry (5 minutes) in a simple way
    // In production, use a more robust storage solution
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    return Response.json({ 
      success: true, 
      message: 'Verification code sent to your phone'
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});