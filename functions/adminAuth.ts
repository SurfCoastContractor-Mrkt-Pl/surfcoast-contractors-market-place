import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { password } = await req.json();

    if (!password) {
      return Response.json({ success: false, error: 'Password required.' }, { status: 400 });
    }

    const adminPassword = Deno.env.get('ADMIN_DASHBOARD_PASSWORD');
    if (!adminPassword) {
      console.error('ADMIN_DASHBOARD_PASSWORD secret is not set.');
      return Response.json({ success: false, error: 'Server misconfiguration.' }, { status: 500 });
    }

    if (password !== adminPassword) {
      console.warn('Failed admin login attempt at', new Date().toISOString());
      return Response.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('adminAuth error:', error.message);
    return Response.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
});