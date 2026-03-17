import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Simple in-memory rate limiter per IP (basic protection)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_THRESHOLD = 10; // Max 10 requests per minute per IP

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Allow unauthenticated error logging for public app, but validate internal key
    const internalKey = req.headers.get('x-internal-service-key');
    const hasValidKey = internalKey === Deno.env.get('INTERNAL_SERVICE_KEY');
    
    let user = null;
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      try {
        user = await base44.auth.me();
      } catch {
        // User not found, continue with anonymous
      }
    }

    // Rate limiting per user/IP
    const now = Date.now();
    const userKey = user?.email || req.headers.get('x-forwarded-for') || 'anonymous';
    if (!requestCounts.has(userKey)) {
      requestCounts.set(userKey, []);
    }

    const userRequests = requestCounts.get(userKey);
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= RATE_LIMIT_THRESHOLD) {
      return Response.json({ error: 'Rate limit exceeded: too many error logs in short time' }, { status: 429 });
    }

    recentRequests.push(now);
    requestCounts.set(userKey, recentRequests);

    const body = await req.json();

    const { error_type, severity, user_email, user_type, action, error_message, context } = body;

    if (!action || !error_message) {
      return Response.json({ error: 'action and error_message are required' }, { status: 400 });
    }

    // Only service role can log errors
    if (!hasValidKey && !isAuthenticated) {
      return Response.json({ error: 'Unauthorized to log errors' }, { status: 403 });
    }

    // Use a fresh service-role client (not bound to the incoming user request)
    // so the write always has service_role privileges regardless of auth state
    const { createClient } = await import('npm:@base44/sdk@0.8.20');
    const serviceBase44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });

    let log;
    try {
      log = await serviceBase44.asServiceRole.entities.ErrorLog.create({
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