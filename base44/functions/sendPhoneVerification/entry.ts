import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { phone, userEmail } = body;

    if (!phone || !userEmail) {
      return Response.json({ error: 'Phone and email required' }, { status: 400 });
    }

    // If authenticated, ensure userEmail matches the session
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (!user || user.email.toLowerCase() !== userEmail.toLowerCase()) {
        return Response.json({ error: 'Forbidden: email does not match authenticated user' }, { status: 403 });
      }
    }

    // SECURITY: Database-backed rate limiting per user/phone combo
    const normalizedPhone = phone.replace(/\D/g, '');
    const requestKey = `${userEmail}:${normalizedPhone}`;
    const now = new Date();
    const oneHourAgo = new Date(Date.now() - 3600000);
    
    const recentAttempts = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: requestKey,
      created_date: { $gte: oneHourAgo.toISOString() }
    });
    
    const RATE_LIMIT_THRESHOLD = 3;
    if (recentAttempts && recentAttempts.length >= RATE_LIMIT_THRESHOLD) {
      return Response.json({ error: 'Too many verification requests. Please try again in 1 hour.' }, { status: 429 });
    }

    // Log this attempt
    await base44.asServiceRole.entities.RateLimitTracker.create({
      key: requestKey,
      action: 'send_phone_verification',
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
      user_email: userEmail
    });

    // Check if customer profile exists and if phone matches (optional, not required for new users)
    const profiles = await base44.entities.CustomerProfile.filter({
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
    
    // Store code in database with 5 minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await base44.asServiceRole.entities.PhoneVerification.create({
      email: userEmail,
      phone: normalizedPhone,
      code: code,
      expires_at: expiresAt,
      verified: false
    });

    // SMS via Twilio — skipped until Twilio is configured
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken && fromPhone) {
      const toPhone = normalizedPhone.startsWith('1')
        ? `+${normalizedPhone}`
        : `+1${normalizedPhone}`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = btoa(`${accountSid}:${authToken}`);

      const formData = new URLSearchParams();
      formData.append('From', fromPhone);
      formData.append('To', toPhone);
      formData.append('Body', `Your verification code is: ${code}`);

      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!twilioResponse.ok) {
        console.error('Twilio error');
        return Response.json({ error: 'Failed to send verification code' }, { status: 500 });
      }
    } else {
      console.warn('Twilio not configured — SMS skipped. Code stored in DB only.');
    }

    return Response.json({ 
      success: true, 
      message: 'Verification code sent'
    });
    } catch (error) {
    console.error('Phone verification error');
    return Response.json({ error: 'Failed to send verification code' }, { status: 500 });
    }
});