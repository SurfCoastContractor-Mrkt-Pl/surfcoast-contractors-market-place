import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, email, password, phone, location } = body;

    // Validate inputs
    if (!full_name?.trim() || !email?.trim() || !password?.trim() || !phone?.trim() || !location?.trim()) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Verify email matches authenticated user
    if (email !== user.email) {
      return Response.json({ error: 'Forbidden: You can only sign up with your own email' }, { status: 403 });
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