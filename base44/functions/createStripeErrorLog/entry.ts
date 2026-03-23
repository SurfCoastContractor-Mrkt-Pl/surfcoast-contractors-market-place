import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Validate authorization: internal key check for service-to-service calls
    const providedKey = req.headers.get('x-internal-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');

    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      // User not authenticated
    }

    const isAdmin = user?.role === 'admin';
    const isValidInternalCall = providedKey && expectedKey && providedKey === expectedKey;

    // Only allow: (1) authenticated admin users, or (2) valid internal service calls
    if (!isAdmin && !isValidInternalCall) {
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
            body: `Error Type: ${error_type}\nMessage: ${error_message}\n\nPlease check the ErrorLog in the admin dashboard.`,
          });
        } catch (emailError) {
          console.error('Failed to send admin alert');
        }
      }
    }

    return Response.json({ success: true, error_log_id: errorLog.id });
  } catch (error) {
    console.error('Error creating error log');
    return Response.json({ error: 'Failed to create error log' }, { status: 500 });
  }
});