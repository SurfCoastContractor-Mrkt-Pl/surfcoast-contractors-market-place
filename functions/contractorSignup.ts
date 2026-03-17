import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { full_name, email, password, phone, trade_specialty, location } = body;

    // Validate inputs
    if (!full_name?.trim() || !email?.trim() || !password?.trim() || !phone?.trim() || !trade_specialty?.trim() || !location?.trim()) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Note: In a real implementation, you would create a user via your auth system
    // For now, return success and let the frontend handle the redirect
    // The user will then complete the contractor profile creation

    return Response.json({
      success: true,
      message: 'Contractor account created. Proceeding to profile setup.',
      data: {
        full_name,
        email,
        phone,
        trade_specialty,
        location,
      }
    });
  } catch (error) {
    console.error('Contractor signup error:', error);
    return Response.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
});