import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.role !== 'service_role')) {
      return Response.json({ error: 'Unauthorized - admin or service role required' }, { status: 403 });
    }

    const body = await req.json();
    const { check_id, check_name, check_type, status, response_time_ms, error_message, metadata } = body;

    if (!check_id || !check_name || !check_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const healthRecord = await base44.asServiceRole.entities.HealthCheck.create({
      check_id,
      check_name,
      check_type,
      status: status || 'unknown',
      response_time_ms: response_time_ms || 0,
      error_message: error_message || null,
      last_check_at: new Date().toISOString(),
      metadata: metadata ? JSON.stringify(metadata) : null
    });

    return Response.json({ success: true, id: healthRecord.id });
  } catch (error) {
    console.error('logHealthCheck error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});