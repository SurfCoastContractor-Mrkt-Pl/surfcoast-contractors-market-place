import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json().catch(() => ({}));
    const providedPassword = body?.password;
    const dashboardPassword = Deno.env.get('ADMIN_DASHBOARD_PASSWORD');

    // Verify password if configured (primary protection)
    if (!dashboardPassword) {
      console.error(`[${requestId}] ADMIN_DASHBOARD_PASSWORD not configured`);
      return Response.json({ success: false, error: 'Admin dashboard not configured' }, { status: 500 });
    }

    if (providedPassword !== dashboardPassword) {
      console.warn(`[${requestId}] Invalid admin dashboard password attempt`);
      return Response.json({ success: false, error: 'Invalid password.' }, { status: 403 });
    }

    // Password validated successfully
    return Response.json({ success: true });
  } catch (error) {
    console.error(`[${requestId}] adminAuth error:`, error.message);
    return Response.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
});