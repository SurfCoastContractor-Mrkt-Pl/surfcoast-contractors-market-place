import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Backend error logging function
// Called from frontend error monitoring system OR entity automations

const VALID_LEVELS = ['debug', 'info', 'warning', 'error', 'critical'];
const VALID_CATEGORIES = ['javascript', 'network', 'api', 'auth', 'payment', 'unknown'];

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Detect entity automation payload: { event, data, automation }
    const isAutomation = !!(body.event && body.event.type);

    // For direct (non-automation) calls, require either an internal service key OR
    // an authenticated user. This prevents unauthenticated flood/spam attacks on the
    // error log entity while keeping the function usable from the app's own frontend.
    if (!isAutomation) {
      const internalKey = req.headers.get('x-internal-service-key') || body.internal_service_key;
      const validInternalKey = Deno.env.get('INTERNAL_SERVICE_KEY');
      const hasValidServiceKey = validInternalKey && internalKey === validInternalKey;

      if (!hasValidServiceKey) {
        const user = await base44.auth.me().catch(() => null);
        if (!user) {
          // Rate-limit anonymous callers: accept but truncate message to prevent data bloat
          // and do NOT send admin alert emails for unauthenticated submissions
          if (!body.message || !body.level || !body.category) {
            return Response.json({ error: 'Missing required error fields' }, { status: 400 });
          }
          // Only allow debug/info/warning from anonymous — block critical spam
          const safeLevel = ['debug', 'info', 'warning'].includes(body.level) ? body.level : 'info';
          await base44.asServiceRole.entities.ErrorLog.create({
            message: String(body.message).slice(0, 500),
            level: safeLevel,
            category: VALID_CATEGORIES.includes(body.category) ? body.category : 'unknown',
            stack: '',
            context: {},
            user_id: 'anonymous',
            url: String(body.url || '').slice(0, 200),
            user_agent: String(body.userAgent || body.user_agent || '').slice(0, 200),
            resolved: false
          });
          return Response.json({ success: true, logged: true });
        }
      }
    }

    let errorData;
    if (isAutomation) {
      // For entity automations, build a synthetic log entry from the event
      const eventData = body.data || {};
      errorData = {
        message: eventData.message || `ErrorLog entity event: ${body.event.type} on ${body.event.entity_name} (id: ${body.event.entity_id})`,
        level: VALID_LEVELS.includes(eventData.level) ? eventData.level : 'error',
        category: VALID_CATEGORIES.includes(eventData.category) ? eventData.category : 'unknown',
        stack: eventData.stack || '',
        context: typeof eventData.context === 'object' ? eventData.context : {},
        user_id: eventData.user_id || eventData.userId || '',
        url: eventData.url || '',
        user_agent: eventData.userAgent || eventData.user_agent || '',
      };
    } else {
      // Direct API call — validate required fields
      if (!body.message || !body.level || !body.category) {
        return Response.json({ error: 'Missing required error fields: message, level, category' }, { status: 400 });
      }
      errorData = {
        message: body.message,
        level: VALID_LEVELS.includes(body.level) ? body.level : 'error',
        category: VALID_CATEGORIES.includes(body.category) ? body.category : 'unknown',
        stack: body.stack || '',
        context: typeof body.context === 'object' ? body.context : {},
        user_id: body.userId || body.user_id || '',
        url: body.url || '',
        user_agent: body.userAgent || body.user_agent || '',
      };
    }

    // Save to database
    await base44.asServiceRole.entities.ErrorLog.create({
      message: errorData.message,
      level: errorData.level,
      category: errorData.category,
      stack: errorData.stack,
      context: typeof errorData.context === 'object' ? errorData.context : {},
      user_id: errorData.user_id,
      url: errorData.url,
      user_agent: errorData.user_agent,
      resolved: false
    });

    console.log(`Error logged: [${errorData.level}] ${errorData.category} - ${errorData.message}`);

    // Alert admin on critical errors
    if (errorData.level === 'critical') {
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `[CRITICAL] ${errorData.category}: ${errorData.message}`,
            body: `Critical error occurred:\nMessage: ${errorData.message}\nCategory: ${errorData.category}\nURL: ${errorData.url}\nUser: ${errorData.user_id || 'unknown'}\nTimestamp: ${new Date().toISOString()}\n\nContext: ${errorData.context}\n\nStack: ${errorData.stack}`
          });
        } catch (emailErr) {
          console.error('Failed to send alert email:', emailErr.message);
        }
      }
    }

    return Response.json({ success: true, logged: true });
  } catch (error) {
    console.error('logErrorEvent error:', error.message);
    return Response.json({ success: false, error: 'Failed to log error' }, { status: 500 });
  }
});