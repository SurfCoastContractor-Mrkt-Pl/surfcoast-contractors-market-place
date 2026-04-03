import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Categorize error severity based on keywords and error type
function categorizeSeverity(errorMessage, errorType, pageOrFeature) {
  const criticalKeywords = ['payment', 'stripe', 'login', 'auth', 'data loss', 'crash', '500', 'security'];
  const highKeywords = ['failed', 'submit', 'notification', '400', '401', '403', '404'];
  const mediumKeywords = ['slow', 'timeout', 'minor', '429'];
  
  const lowerError = errorMessage.toLowerCase() + errorType.toLowerCase();
  
  if (criticalKeywords.some(kw => lowerError.includes(kw))) return 'critical';
  if (highKeywords.some(kw => lowerError.includes(kw))) return 'high';
  if (mediumKeywords.some(kw => lowerError.includes(kw))) return 'medium';
  return 'low';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const {
      userEmail,
      userName,
      userId,
      pageOrFeature,
      actionAttempted,
      errorMessage,
      errorStack,
      platform,
      system
    } = body;
    
    if (!userEmail || !pageOrFeature || !actionAttempted || !errorMessage) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const severity = categorizeSeverity(errorMessage, actionAttempted, pageOrFeature);
    
    // Create ErrorLog using service role
    const errorLog = await base44.asServiceRole.entities.ErrorLog.create({
      userEmail,
      userName: userName || 'Unknown User',
      userId: userId || 'unknown',
      pageOrFeature,
      actionAttempted,
      errorMessage,
      errorStack: errorStack || '',
      timestamp: new Date().toISOString(),
      platform: platform || 'desktop',
      system: system || 'main_app',
      severity,
      isResolved: false
    });
    
    // Trigger admin alert
    try {
      await base44.functions.invoke('sendAdminAlerts', {
        errorLogId: errorLog.id,
        severity,
        userEmail,
        pageOrFeature,
        errorMessage
      });
    } catch (alertError) {
      console.error('Failed to send admin alert:', alertError.message);
      // Don't fail the error log creation if alert fails
    }
    
    return Response.json({ success: true, errorLogId: errorLog.id });
  } catch (error) {
    console.error('Error in logFrontendError:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});