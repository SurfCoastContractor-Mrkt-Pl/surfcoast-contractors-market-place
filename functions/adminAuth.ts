import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      return Response.json({ success: false, error: 'Password required.' }, { status: 400 });
    }

    const correctPassword = Deno.env.get('ADMIN_DASHBOARD_PASSWORD');
    if (!correctPassword) {
      console.error('ADMIN_DASHBOARD_PASSWORD not set');
      return Response.json({ success: false, error: 'Server error.' }, { status: 500 });
    }

    if (password !== correctPassword) {
      return Response.json({ success: false, error: 'Invalid password.' }, { status: 403 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('adminAuth error:', error.message);
    return Response.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
});