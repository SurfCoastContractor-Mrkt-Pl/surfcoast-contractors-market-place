import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { errorLogId, severity, userEmail, pageOrFeature, errorMessage } = body;
    const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL') || 'admin@surfcoast.io';
    
    // Format severity color/urgency
    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };
    
    const emoji = severityEmoji[severity] || '🔵';
    
    // Send email to admin
    const emailBody = `
${emoji} ${severity.toUpperCase()} ERROR ALERT

User: ${userEmail}
Page/Feature: ${pageOrFeature}
Error: ${errorMessage}
Time: ${new Date().toISOString()}

View full details in the Admin Error Logs panel.
Error ID: ${errorLogId}
    `.trim();
    
    try {
      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `${emoji} [${severity.toUpperCase()}] Platform Error - ${pageOrFeature}`,
        body: emailBody
      });
    } catch (emailError) {
      console.error('Failed to send email alert:', emailError.message);
    }
    
    // In a real system, this would also trigger push notifications and in-app alerts
    // For now, we'll just log the alert
    console.log(`[ALERT] ${emoji} ${severity} error for ${userEmail}: ${errorMessage}`);
    
    return Response.json({ success: true, alerted: true });
  } catch (error) {
    console.error('Error in sendAdminAlerts:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});