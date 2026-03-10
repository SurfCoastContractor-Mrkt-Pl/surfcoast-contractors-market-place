import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Simple in-memory rate limiter per IP (basic protection)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_THRESHOLD = 10; // Max 10 requests per minute per IP

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Require authentication - prevent anonymous error log flooding
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting per user
    const now = Date.now();
    const userKey = user.email;
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

    const log = await base44.asServiceRole.entities.ErrorLog.create({
      error_type: error_type || 'other',
      severity: severity || 'medium',
      user_email: user_email || user.email,
      user_type: user_type || 'unknown',
      action,
      error_message,
      context: typeof context === 'object' ? JSON.stringify(context) : (context || ''),
      resolved: false,
    });

    // Send email alert to admin for high/critical severity
    if (severity === 'high' || severity === 'critical') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: Deno.env.get('ADMIN_ALERT_EMAIL'),
        from_name: 'SurfCoast Error Monitor',
        subject: `🚨 ${severity?.toUpperCase()} Error: ${action}`,
        body: `A ${severity} error was logged on SurfCoast.\n\nUser: ${user_email || user.email} (${user_type || 'unknown'})\nAction: ${action}\nError: ${error_message}\nContext: ${typeof context === 'object' ? JSON.stringify(context, null, 2) : (context || 'N/A')}\nTime: ${new Date().toISOString()}\n\nLog ID: ${log.id}\n\nPlease review at your Admin Dashboard → Error Log tab.`,
      });
    }

    console.log(`[ErrorLog] ${severity} | ${error_type} | ${user_email} | ${action} | ${error_message}`);
    return Response.json({ success: true, id: log.id });
  } catch (error) {
    console.error('Error in logError function:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});