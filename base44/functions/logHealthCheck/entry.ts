import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Log health check results
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const serviceKey = req.headers.get('x-internal-key');
    const validServiceKey = serviceKey && serviceKey === Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!validServiceKey) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin or internal service access required' }, { status: 403 });
      }
    }
    const healthData = await req.json();

    // Log the health check result
    const logEntry = {
      check_id: healthData.checkId,
      check_name: healthData.checkName,
      check_type: healthData.checkType,
      status: healthData.status,
      response_time_ms: healthData.responseTime || 0,
      error_message: healthData.error,
      critical: healthData.critical || false,
      last_check_at: new Date().toISOString()
    };

    try {
      await base44.asServiceRole.entities.HealthCheck.create(logEntry);
    } catch (dbErr) {
      console.error('Failed to save health check:', dbErr);
    }

    // Alert on critical failures
    if (healthData.critical && healthData.status === 'unhealthy') {
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        try {
          await base44.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `[CRITICAL] Health Check Failed: ${healthData.checkName}`,
            body: `
Critical health check failure detected:

Check: ${healthData.checkName}
Type: ${healthData.checkType}
Status: ${healthData.status}
Error: ${healthData.error || 'No error message'}
Timestamp: ${new Date().toISOString()}

Immediate attention required.
            `
          });
        } catch (emailErr) {
          console.error('Failed to send alert email:', emailErr);
        }
      }
    }

    return Response.json({ success: true, logged: true });
  } catch (error) {
    console.error('logHealthCheck error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});