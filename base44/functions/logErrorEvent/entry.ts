import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Backend error logging function
// Called from frontend error monitoring system

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both direct calls ({ message, level, category })
    // and entity automation payloads ({ event, data: { message, level, category } })
    const isAutomation = !!(body.event || body.automation);
    const errorData = isAutomation ? (body.data ?? {}) : body;

    console.log('logErrorEvent called, isAutomation:', isAutomation, 'body keys:', Object.keys(body));

    // For direct API calls (not automation), validate required fields
    if (!isAutomation && (!errorData.message || !errorData.level || !errorData.category)) {
      return Response.json({ error: 'Missing required error fields' }, { status: 400 });
    }

    // Apply defaults for any missing fields
    if (!errorData.message) errorData.message = body.event ? `ErrorLog ${body.event.type}: entity_id=${body.event.entity_id}` : 'Unknown error';
    if (!errorData.level) errorData.level = 'error';
    if (!errorData.category) errorData.category = 'unknown';

    // Create error log entry
    const logEntry = {
      message: errorData.message,
      level: errorData.level,
      category: errorData.category,
      stack: errorData.stack || '',
      context: errorData.context || {},
      user_id: errorData.userId,
      url: errorData.url || '',
      user_agent: errorData.userAgent || '',
      resolved: false
    };

    // Save to database
    await base44.asServiceRole.entities.ErrorLog.create(logEntry);

    // Log critical errors for admin attention
    if (errorData.level === 'critical') {
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        try {
          await base44.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `[CRITICAL] ${errorData.category}: ${errorData.message}`,
            body: `
Critical error occurred:
Message: ${errorData.message}
Category: ${errorData.category}
URL: ${errorData.url}
User ID: ${errorData.userId || 'unknown'}
Timestamp: ${new Date().toISOString()}

Context: ${JSON.stringify(errorData.context, null, 2)}

Stack: ${errorData.stack}
            `
          });
        } catch (emailErr) {
          console.error('Failed to send alert email:', emailErr);
        }
      }
    }

    return Response.json({ success: true, logged: true });
  } catch (error) {
    console.error('logErrorEvent error:', error);
    // Don't expose internal errors
    return Response.json({ success: false, error: 'Failed to log error' }, { status: 500 });
  }
});