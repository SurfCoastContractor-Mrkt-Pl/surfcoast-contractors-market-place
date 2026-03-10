import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      console.warn(`Non-admin access attempt by ${user.email} at ${new Date().toISOString()}`);
      return Response.json({ success: false, error: 'Admin access required.' }, { status: 403 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('adminAuth error:', error.message);
    return Response.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
});