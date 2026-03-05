import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Simple in-memory storage for demo (use database in production)
const verificationCodes = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { phone, code, userEmail } = body;

    if (!phone || !code || !userEmail) {
      return Response.json({ error: 'Phone, code, and email required' }, { status: 400 });
    }

    // Check if phone is associated with email
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

    // For now, accept any 6-digit code (in production, verify against stored code)
    // This is a placeholder - implement proper verification with SMS provider
    if (code.length === 6 && /^\d+$/.test(code)) {
      return Response.json({ success: true, message: 'Phone verified' });
    }

    return Response.json({ error: 'Invalid verification code' }, { status: 400 });
  } catch (error) {
    console.error('Phone verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});