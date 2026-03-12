import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Check optional dashboard password first
    const body = await req.json().catch(() => ({}));
    const providedPassword = body?.password;
    const dashboardPassword = Deno.env.get('ADMIN_DASHBOARD_PASSWORD');

    if (dashboardPassword && providedPassword !== dashboardPassword) {
      return Response.json({ success: false, error: 'Invalid password.' }, { status: 403 });
    }

    // Also require authenticated admin role
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      return Response.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ success: false, error: 'Admin access required.' }, { status: 403 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('adminAuth error:', error.message);
    return Response.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
});