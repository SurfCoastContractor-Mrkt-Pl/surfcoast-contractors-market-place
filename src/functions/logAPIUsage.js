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
    const { endpoint, method, status_code, response_time_ms, error_message, metadata } = body;

    if (!endpoint || !method || status_code === undefined || response_time_ms === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiUsageRecord = await base44.asServiceRole.entities.APIUsage.create({
      endpoint,
      method,
      status_code,
      response_time_ms,
      user_id: user.id,
      user_email: user.email,
      error_message: error_message || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      date: new Date().toISOString().split('T')[0]
    });

    return Response.json({ success: true, id: apiUsageRecord.id });
  } catch (error) {
    console.error('logAPIUsage error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});