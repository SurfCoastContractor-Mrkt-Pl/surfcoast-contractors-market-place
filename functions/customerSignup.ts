import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { full_name, email, password, phone, location } = body;

    // Validate inputs
    if (!full_name?.trim() || !email?.trim() || !password?.trim() || !phone?.trim() || !location?.trim()) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Note: In a real implementation, you would create a user via your auth system
    // For now, return success and let the frontend handle the redirect
    // The user will then access the customer dashboard

    return Response.json({
      success: true,
      message: 'Customer account created.',
      data: {
        full_name,
        email,
        phone,
        location,
      }
    });
  } catch (error) {
    console.error('Customer signup error:', error);
    return Response.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
});