import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Backend activity logging function
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();

    let activityData;

    // Support automation entity event payloads ({ event, data })
    if (body.event && body.data) {
      const { event, data } = body;
      activityData = {
        action_type: `${event.entity_name}_${event.type}`,
        entity_type: event.entity_name,
        entity_id: event.entity_id,
        entity_name: data.job_title || data.contractor_name || event.entity_name,
        user_email: data.reviewer_email || data.contractor_email || data.created_by || '',
        description: `${event.entity_name} ${event.type}: ${data.comment || data.job_title || event.entity_id}`,
        severity: 'low',
        status: 'success',
        metadata: JSON.stringify({ entity: event.entity_name, id: event.entity_id })
      };
    } else {
      // Direct call — require auth
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      activityData = body;
    }

    // Validate required fields
    if (!activityData.action_type || !activityData.entity_type) {
      return Response.json({ error: 'Missing required activity fields' }, { status: 400 });
    }

    // Get client IP from headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') ||
                     'unknown';

    // Create activity log entry
    const logEntry = {
      action_type: activityData.action_type,
      entity_type: activityData.entity_type,
      entity_id: activityData.entity_id,
      entity_name: activityData.entity_name,
      user_id: activityData.user_id,
      user_email: activityData.user_email,
      description: activityData.description || '',
      severity: activityData.severity || 'low',
      changes: activityData.changes,
      metadata: activityData.metadata,
      ip_address: clientIp,
      user_agent: activityData.user_agent || '',
      status: activityData.status || 'success'
    };

    // Save to database
    try {
      await base44.asServiceRole.entities.ActivityLog.create(logEntry);
    } catch (dbErr) {
      console.error('Failed to save activity log:', dbErr);
      // Don't fail the request if logging fails
    }

    // Alert on critical security events
    if (activityData.severity === 'critical') {
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        try {
          await base44.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `[CRITICAL AUDIT] ${activityData.action_type.toUpperCase()}: ${activityData.entity_type}`,
            body: `
Critical activity detected:

Action: ${activityData.action_type}
Entity: ${activityData.entity_type} ${activityData.entity_id ? `(${activityData.entity_id})` : ''}
User: ${activityData.user_email || activityData.user_id || 'unknown'}
IP: ${clientIp}
Description: ${activityData.description}
Timestamp: ${new Date().toISOString()}

Metadata: ${activityData.metadata}
            `
          });
        } catch (emailErr) {
          console.error('Failed to send alert email:', emailErr);
        }
      }
    }

    return Response.json({ success: true, logged: true });
  } catch (error) {
    console.error('logActivity error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});