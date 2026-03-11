import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Validate authorization: only admins or service-role contexts can create error logs
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      // User not authenticated
    }

    // Allow if: (1) authenticated as admin, or (2) called from service-role context (other backend function)
    const isAdmin = user?.role === 'admin';
    const isServiceRoleCall = req.headers.get('x-service-role') === 'true';

    if (!isAdmin && !isServiceRoleCall) {
      console.warn(`Unauthorized error log creation attempt from ${user?.email || 'unauthenticated'}`);
      return Response.json(
        { error: 'Unauthorized: only admins or internal service calls allowed' },
        { status: 403 }
      );
    }

    const {
      error_type,
      error_message,
      user_email,
      user_type,
      action,
      context,
      severity = 'medium',
      isServiceRoleCall: _isServiceRoleCall,
    } = await req.json();

    if (!error_type || !error_message || !action) {
      return Response.json(
        { error: 'error_type, error_message, and action are required' },
        { status: 400 }
      );
    }

    // Create error log (service role to bypass auth)
    const errorLog = await base44.asServiceRole.entities.ErrorLog.create({
      error_type,
      error_message,
      user_email: user_email || 'unknown',
      user_type: user_type || 'unknown',
      action,
      context: context || '',
      severity,
      resolved: false,
    });

    // If critical severity and admin email exists, send alert
    if (severity === 'critical') {
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        try {
          await base44.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `🚨 Critical Payment Error: ${action}`,
            body: `Error Type: ${error_type}\nMessage: ${error_message}\nUser: ${user_email || 'unknown'}\n\nPlease check the ErrorLog in the admin dashboard.`,
          });
        } catch (emailError) {
          console.error('Failed to send admin alert:', emailError.message);
        }
      }
    }

    return Response.json({ success: true, error_log_id: errorLog.id });
  } catch (error) {
    console.error('Error creating error log:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});