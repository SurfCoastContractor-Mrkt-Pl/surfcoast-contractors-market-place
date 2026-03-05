import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Simple in-memory storage for verification codes
const verificationStore = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { code, userEmail } = body;

    if (!code || !userEmail) {
      return Response.json({ error: 'Code and email required' }, { status: 400 });
    }

    const storedData = verificationStore.get(userEmail);

    if (!storedData) {
      return Response.json({ error: 'No verification code found for this email' }, { status: 400 });
    }

    // Check expiry
    if (Date.now() > storedData.expiresAt) {
      verificationStore.delete(userEmail);
      return Response.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Check code
    if (storedData.code !== code.toString()) {
      return Response.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Code is valid, delete it
    verificationStore.delete(userEmail);

    return Response.json({ 
      success: true, 
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});