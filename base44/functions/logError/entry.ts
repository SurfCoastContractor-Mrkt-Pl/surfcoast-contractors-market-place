import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // SECURITY: Validate authentication/authorization BEFORE parsing body
    const internalKey = req.headers.get('x-internal-service-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    const hasValidKey = expectedKey && internalKey === expectedKey;
    
    let user = null;
    let isAuthenticated = false;
    
    try {
      isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        user = await base44.auth.me();
      }
    } catch {
      // Auth check failed
    }

    // SECURITY: Reject unauthenticated requests early (before processing body)
    if (!hasValidKey && !isAuthenticated) {
      return Response.json({ error: 'Unauthorized to log errors' }, { status: 403 });
    }

    const body = await req.json();
    const { error_type, severity, user_email, user_type, action, error_message, context } = body;

    if (!action || !error_message) {
      return Response.json({ error: 'action and error_message are required' }, { status: 400 });
    }

    // SECURITY: Database-backed rate limiting (not in-memory)
    // In-memory rate limiting is ineffective in serverless environments
    const now = new Date().toISOString();
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const userKey = user?.email || user_email || 'internal';
    
    try {
      const recentErrors = await base44.asServiceRole.entities.ErrorLog.filter({
        user_email: userKey,
        created_date: { $gte: oneMinuteAgo }
      });
      
      if (recentErrors && recentErrors.length >= 10) {
        return Response.json({ error: 'Rate limit exceeded: too many error logs in short time' }, { status: 429 });
      }
    } catch (limitError) {
      console.warn('Rate limit check failed, proceeding:', limitError.message);
    }

    let log;
    try {
      log = await base44.asServiceRole.entities.ErrorLog.create({
        error_type: ['profile_setup', 'payment', 'job_posting', 'verification', 'messaging', 'other'].includes(error_type) ? error_type : 'other',
        severity: severity || 'medium',
        user_email: user_email || user?.email || 'unknown',
        user_type: ['contractor', 'customer', 'unknown'].includes(user_type) ? user_type : 'unknown',
        action,
        error_message,
        context: typeof context === 'object' ? JSON.stringify(context) : (context || ''),
        resolved: false,
      });
    } catch (dbError) {
      console.error('Failed to create error log', dbError.message);
      // Still return success to avoid cascading errors
      return Response.json({ success: true, message: 'Error logged (deferred)' });
    }

    // Send email alert to admin for high/critical severity
    if (severity === 'high' || severity === 'critical') {
      try {
        await base44.integrations.Core.SendEmail({
          to: Deno.env.get('ADMIN_ALERT_EMAIL'),
          subject: `🚨 ${severity?.toUpperCase()} Error: ${action}`,
          body: `A ${severity} error was logged on SurfCoast.\n\nUser: ${user_email || user?.email || 'unknown'} (${user_type || 'unknown'})\nAction: ${action}\nError: ${error_message}\nContext: ${typeof context === 'object' ? JSON.stringify(context, null, 2) : (context || 'N/A')}\nTime: ${new Date().toISOString()}\n\nLog ID: ${log?.id || 'pending'}\n\nPlease review at your Admin Dashboard → Error Log tab.`,
        });
      } catch (emailError) {
        console.error('Failed to send admin alert');
      }
      }

      return Response.json({ success: true, id: log.id });
      } catch (error) {
      console.error('Error in logError function');
      return Response.json({ error: 'Failed to log error' }, { status: 500 });
      }
});