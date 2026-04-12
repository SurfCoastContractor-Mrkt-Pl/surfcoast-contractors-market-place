import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
function categorizeSeverity(errorMessage, functionName) {
  const criticalKeywords = ['payment', 'stripe', 'authentication', 'data loss', 'database', 'critical'];
  const highKeywords = ['failed', 'error', 'invalid', 'unauthorized', '400', '401', '403', '404', '500'];
  
  const lowerError = (errorMessage + functionName).toLowerCase();
  
  if (criticalKeywords.some(kw => lowerError.includes(kw))) return 'critical';
  if (highKeywords.some(kw => lowerError.includes(kw))) return 'high';
  return 'medium';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const {
      userEmail,
      userName,
      functionName,
      errorMessage,
      errorStack,
      payload
    } = body;
    
    if (!userEmail || !functionName || !errorMessage) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const severity = categorizeSeverity(errorMessage, functionName);
    const pageOrFeature = `Backend: ${functionName}`;
    const actionAttempted = `Invoking ${functionName}${payload ? ` with payload: ${JSON.stringify(payload).substring(0, 100)}` : ''}`;
    
    // Create ErrorLog using service role
    const errorLog = await base44.asServiceRole.entities.ErrorLog.create({
      userEmail: userEmail || 'system@surfcoast.io',
      userName: userName || 'System User',
      userId: 'system',
      pageOrFeature,
      actionAttempted,
      errorMessage,
      errorStack: errorStack || '',
      timestamp: new Date().toISOString(),
      platform: 'desktop',
      system: 'main_app',
      severity,
      isResolved: false
    });
    
    // Trigger admin alert
    try {
      await base44.functions.invoke('sendAdminAlerts', {
        errorLogId: errorLog.id,
        severity,
        userEmail: userEmail || 'system@surfcoast.io',
        pageOrFeature,
        errorMessage
      });
    } catch (alertError) {
      console.error('Failed to send admin alert:', alertError.message);
    }
    
    return Response.json({ success: true, errorLogId: errorLog.id });
  } catch (error) {
    console.error('Error in logBackendError:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});