import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { action_type, entity_type, entity_id, description, severity, metadata } = body;

    if (!action_type || !entity_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const activityRecord = await base44.asServiceRole.entities.ActivityLog.create({
      action_type,
      entity_type,
      entity_id: entity_id || null,
      user_id: user.id,
      user_email: user.email,
      description: description || null,
      severity: severity || 'low',
      metadata: metadata ? JSON.stringify(metadata) : null,
      status: 'success'
    });

    return Response.json({ success: true, id: activityRecord.id });
  } catch (error) {
    console.error('logActivity error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});