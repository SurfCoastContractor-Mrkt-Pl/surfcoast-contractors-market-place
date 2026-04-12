import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { endpoint, ip_address } = body;

    if (!endpoint) {
      return Response.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const tracker = await base44.asServiceRole.entities.RateLimitTracker.filter({
      endpoint,
      ip_address: ip_address || ''
    }, '-last_violation_at', 1);

    const rateLimitData = tracker[0] || null;
    const isBlocked = rateLimitData?.blocked || false;

    return Response.json({
      blocked: isBlocked,
      rateLimitData,
      requestBy: user.email
    });
  } catch (error) {
    console.error('checkRateLimit error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});