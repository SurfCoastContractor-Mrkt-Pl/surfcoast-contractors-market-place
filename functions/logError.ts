import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { error_type, severity, user_email, user_type, action, error_message, context } = body;

    if (!action || !error_message) {
      return Response.json({ error: 'action and error_message are required' }, { status: 400 });
    }

    const log = await base44.asServiceRole.entities.ErrorLog.create({
      error_type: error_type || 'other',
      severity: severity || 'medium',
      user_email: user_email || 'unknown',
      user_type: user_type || 'unknown',
      action,
      error_message,
      context: typeof context === 'object' ? JSON.stringify(context) : (context || ''),
      resolved: false,
    });

    // Send email alert to admin for high/critical severity
    if (severity === 'high' || severity === 'critical') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'admin@surfcoastcontractors.com.au',
        from_name: 'SurfCoast Error Monitor',
        subject: `🚨 ${severity?.toUpperCase()} Error: ${action}`,
        body: `A ${severity} error was logged on SurfCoast.\n\nUser: ${user_email || 'unknown'} (${user_type || 'unknown'})\nAction: ${action}\nError: ${error_message}\nContext: ${typeof context === 'object' ? JSON.stringify(context, null, 2) : (context || 'N/A')}\nTime: ${new Date().toISOString()}\n\nLog ID: ${log.id}\n\nPlease review at your Admin Dashboard → Error Log tab.`,
      });
    }

    console.log(`[ErrorLog] ${severity} | ${error_type} | ${user_email} | ${action} | ${error_message}`);
    return Response.json({ success: true, id: log.id });
  } catch (error) {
    console.error('Error in logError function:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});