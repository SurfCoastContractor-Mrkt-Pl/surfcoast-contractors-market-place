import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Simple in-memory storage for verification codes (use database in production)
const verificationStore = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { phone, code, userEmail } = body;

    if (!phone || !code || !userEmail) {
      return Response.json({ error: 'Phone, code, and email required' }, { status: 400 });
    }

    // If authenticated, ensure userEmail matches the session
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user.email.toLowerCase() !== userEmail.toLowerCase()) {
        return Response.json({ error: 'Forbidden: email does not match authenticated user' }, { status: 403 });
      }
    }

    // Verify customer profile exists for this email
    const profiles = await base44.asServiceRole.entities.CustomerProfile.filter({
      email: userEmail
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    const key = `${userEmail}-${normalizedPhone}`;

    // Check stored verification code
    const stored = verificationStore.get(key);
    if (!stored) {
      return Response.json({ error: 'Verification code expired or not sent' }, { status: 400 });
    }

    // Check if expired
    if (Date.now() > stored.expiresAt) {
      verificationStore.delete(key);
      return Response.json({ error: 'Verification code expired' }, { status: 400 });
    }

    // Verify code matches
    if (stored.code !== code) {
      return Response.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Code is valid, remove it from storage
    verificationStore.delete(key);
    return Response.json({ success: true, message: 'Phone verified successfully' });
  } catch (error) {
    console.error('Phone verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});